/**
 * Generate validated public league data by merging automated facts into editorial content.
 * Uses last-known-good publication: failures do not replace the public snapshot.
 *
 * Usage:
 *   npm run generate:public
 */
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LeagueSnapshotSchema } from "../src/schemas";
import { generatePublicSnapshot } from "../src/pipeline/generatePublicSnapshot";
import { NormalizedCoreStatsSchema } from "../src/pipeline/schemas";
import { YunoBallEnrichmentSchema } from "../src/pipeline/yunoballSchemas";
import { publishLastKnownGood, recordPublishFailure } from "../src/pipeline/publish";
import {
  formatCoreStatsFreshnessLog,
  formatManifestFreshnessLog,
  formatPipelineStatusLog,
  formatSnapshotFreshnessLog,
} from "../src/pipeline/freshnessLog";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const editorialPath = path.join(root, "data", "editorial-snapshot.json");
const publicPath = path.join(root, "data", "league-snapshot.json");
const coreStatsPath = path.join(root, "data", "normalized-core-stats.json");
const yunoballPath = path.join(root, "data", "yunoball-enrichment.json");
const manifestPath = path.join(root, "data", "generation-manifest.json");
const stagingPath = path.join(root, "data", "staging", "league-snapshot.json");
const stagingManifestPath = path.join(root, "data", "staging", "generation-manifest.json");
const pipelineStatusPath = path.join(root, "data", "pipeline-status.json");

const publishPaths = {
  publicSnapshot: publicPath,
  stagingSnapshot: stagingPath,
  pipelineStatus: pipelineStatusPath,
  manifest: manifestPath,
  stagingManifest: stagingManifestPath,
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf8")) as unknown;
}

async function main(): Promise<void> {
  const attemptedAt = new Date().toISOString();

  try {
    if (!(await exists(editorialPath))) {
      const result = await recordPublishFailure({
        attemptedAt,
        paths: publishPaths,
        failure: {
          source: "editorial-snapshot",
          step: "retrieve",
          message: `Missing editorial base at data/editorial-snapshot.json`,
        },
      });
      console.error(
        `generate:public FAILED — ${result.status.failure?.source}/${result.status.failure?.step}`,
      );
      console.error(result.status.failure?.message);
      process.exit(1);
    }

    const editorialRaw = await readJson(editorialPath);
    const editorial = LeagueSnapshotSchema.safeParse(editorialRaw);
    if (!editorial.success) {
      const result = await recordPublishFailure({
        attemptedAt,
        paths: publishPaths,
        failure: {
          source: "editorial-snapshot",
          step: "validate",
          message: `Editorial snapshot invalid: ${JSON.stringify(editorial.error.issues)}`,
        },
      });
      console.error(
        `generate:public FAILED — ${result.status.failure?.source}/${result.status.failure?.step}`,
      );
      process.exit(1);
    }

    let coreStats = null;
    if (await exists(coreStatsPath)) {
      const parsed = NormalizedCoreStatsSchema.safeParse(await readJson(coreStatsPath));
      if (!parsed.success) {
        const result = await recordPublishFailure({
          attemptedAt,
          paths: publishPaths,
          failure: {
            source: "normalized-core-stats",
            step: "validate",
            message: `Core stats invalid: ${JSON.stringify(parsed.error.issues)}`,
          },
        });
        console.error(
          `generate:public FAILED — ${result.status.failure?.source}/${result.status.failure?.step}`,
        );
        process.exit(1);
      }
      coreStats = parsed.data;
    } else {
      console.warn(
        "generate:public — normalized-core-stats.json absent; publishing editorial facts only",
      );
    }

    let yunoball = null;
    if (await exists(yunoballPath)) {
      const parsed = YunoBallEnrichmentSchema.safeParse(await readJson(yunoballPath));
      if (!parsed.success) {
        const result = await recordPublishFailure({
          attemptedAt,
          paths: publishPaths,
          failure: {
            source: "yunoball-enrichment",
            step: "validate",
            message: `YunoBall enrichment invalid: ${JSON.stringify(parsed.error.issues)}`,
          },
        });
        console.error(
          `generate:public FAILED — ${result.status.failure?.source}/${result.status.failure?.step}`,
        );
        process.exit(1);
      }
      yunoball = parsed.data;
    }

    const generated = generatePublicSnapshot({
      editorial: editorial.data,
      coreStats,
      yunoball,
      generatedAt: attemptedAt,
      paths: {
        editorialSnapshot: "data/editorial-snapshot.json",
        coreStats: "data/normalized-core-stats.json",
        yunoballEnrichment: "data/yunoball-enrichment.json",
      },
    });

    const published = await publishLastKnownGood({
      snapshot: generated.snapshot,
      serializedSnapshot: generated.serializedSnapshot,
      serializedManifest: generated.serializedManifest,
      attemptedAt,
      paths: publishPaths,
    });

    if (!published.ok) {
      console.error(
        `generate:public FAILED — ${published.status.failure?.source}/${published.status.failure?.step}`,
      );
      console.error(published.status.failure?.message);
      process.exit(1);
    }

    console.log(
      `generate:public OK — ${generated.snapshot.teams.length} teams, methodology ${generated.manifest.methodologyVersion}`,
    );
    console.log(
      `  coreStats=${generated.manifest.inputs.coreStats.present ? "yes" : "no"} yunoball=${generated.manifest.inputs.yunoballEnrichment.status}`,
    );
    if (coreStats) {
      console.log(`  ${formatCoreStatsFreshnessLog(coreStats)}`);
    }
    console.log(`  ${formatManifestFreshnessLog(generated.manifest)}`);
    console.log(`  ${formatSnapshotFreshnessLog(generated.snapshot)}`);
    console.log(`  ${formatPipelineStatusLog(published.status)}`);
    console.log(
      "  wrote data/league-snapshot.json, generation-manifest.json, pipeline-status.json",
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const result = await recordPublishFailure({
      attemptedAt,
      paths: publishPaths,
      failure: {
        source: "generate-public",
        step: "unknown",
        message,
      },
    });
    console.error(
      `generate:public FAILED — ${result.status.failure?.source}/${result.status.failure?.step}`,
    );
    console.error(result.status.failure?.message);
    process.exit(1);
  }
}

main();
