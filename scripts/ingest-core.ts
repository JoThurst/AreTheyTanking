/**
 * Ingest normalized core stats from a fixture (no live network).
 *
 * Usage:
 *   npm run ingest:core
 *   npm run ingest:core -- path/to/provider.json
 */
import { mkdir } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FixtureCoreStatAdapter, NormalizedCoreStatsSchema } from "../src/pipeline";
import { formatCoreStatsFreshnessLog } from "../src/pipeline/freshnessLog";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultFixture = path.join(root, "tests", "fixtures", "core-stats", "provider-all-30.json");
const cacheRoot = path.join(root, "data", "cache", "raw");
const outPath = path.join(root, "data", "normalized-core-stats.json");

async function main(): Promise<void> {
  const fixturePath = path.resolve(process.argv[2] ?? defaultFixture);
  await mkdir(cacheRoot, { recursive: true });

  const adapter = new FixtureCoreStatAdapter({
    fixturePath,
    cacheRoot,
    requireAllTeams: true,
  });

  const normalized = await adapter.ingest();
  const checked = NormalizedCoreStatsSchema.safeParse(normalized);
  if (!checked.success) {
    console.error("ingest:core FAILED validation");
    console.error(JSON.stringify(checked.error.issues, null, 2));
    process.exit(1);
  }

  await writeFile(outPath, `${JSON.stringify(checked.data, null, 2)}\n`, "utf8");
  console.log(
    `ingest:core OK — ${checked.data.teams.length} teams from ${checked.data.meta.sourceName}`,
  );
  console.log(`  ${formatCoreStatsFreshnessLog(checked.data)}`);
  console.log(`  wrote ${path.relative(root, outPath)}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
