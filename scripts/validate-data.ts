/**
 * Validates curated/generated league data against shared Zod schemas.
 *
 * Schema/type parity: Zod schemas in `src/schemas` are the runtime contract;
 * TypeScript types are inferred via `z.infer` (see `src/types`).
 */
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LeagueSnapshotSchema } from "../src/schemas";
import { GenerationManifestSchema } from "../src/pipeline/generationManifest";
import { PipelineStatusSchema } from "../src/pipeline/pipelineStatus";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = path.join(root, "data", "league-snapshot.json");
const editorialPath = path.join(root, "data", "editorial-snapshot.json");
const manifestPath = path.join(root, "data", "generation-manifest.json");
const pipelineStatusPath = path.join(root, "data", "pipeline-status.json");

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function validateSnapshot(label: string, filePath: string): Promise<void> {
  const raw = JSON.parse(await readFile(filePath, "utf8")) as unknown;
  const result = LeagueSnapshotSchema.safeParse(raw);
  if (!result.success) {
    console.error(`validate:data FAILED — ${label}`);
    console.error(JSON.stringify(result.error.issues, null, 2));
    process.exit(1);
  }
  console.log(
    `validate:data OK — ${label}: ${result.data.teams.length} teams, methodology ${result.data.meta.methodologyVersion}`,
  );
}

async function main(): Promise<void> {
  if (!(await exists(snapshotPath))) {
    console.log(
      "validate:data — data/league-snapshot.json not found yet (ATT-003). Schema module loads OK.",
    );
    return;
  }

  await validateSnapshot("league-snapshot", snapshotPath);

  if (await exists(editorialPath)) {
    await validateSnapshot("editorial-snapshot", editorialPath);
  }

  if (await exists(manifestPath)) {
    const raw = JSON.parse(await readFile(manifestPath, "utf8")) as unknown;
    const result = GenerationManifestSchema.safeParse(raw);
    if (!result.success) {
      console.error("validate:data FAILED — generation-manifest");
      console.error(JSON.stringify(result.error.issues, null, 2));
      process.exit(1);
    }
    console.log(
      `validate:data OK — generation-manifest: methodology ${result.data.methodologyVersion}`,
    );
  }

  if (await exists(pipelineStatusPath)) {
    const raw = JSON.parse(await readFile(pipelineStatusPath, "utf8")) as unknown;
    const result = PipelineStatusSchema.safeParse(raw);
    if (!result.success) {
      console.error("validate:data FAILED — pipeline-status");
      console.error(JSON.stringify(result.error.issues, null, 2));
      process.exit(1);
    }
    console.log(
      `validate:data OK — pipeline-status: ${result.data.status} stale=${result.data.stale}`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
