/**
 * Ingest optional YunoBall sanitized export.
 * Missing artifact → skipped enrichment (exit 0) so curated builds are not blocked.
 *
 * Usage:
 *   npm run ingest:yunoball
 *   npm run ingest:yunoball -- path/to/export.json
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { YunoBallExportAdapter } from "../src/pipeline/yunoballAdapter";
import { YunoBallEnrichmentSchema } from "../src/pipeline/yunoballSchemas";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultExport = path.join(root, "data", "yunoball", "export.json");
const cacheRoot = path.join(root, "data", "cache", "raw");
const outPath = path.join(root, "data", "yunoball-enrichment.json");

async function main(): Promise<void> {
  const exportPath = path.resolve(process.argv[2] ?? defaultExport);
  await mkdir(cacheRoot, { recursive: true });
  await mkdir(path.dirname(outPath), { recursive: true });

  const adapter = new YunoBallExportAdapter({
    exportPath,
    cacheRoot,
    required: false,
  });

  const enrichment = await adapter.ingest();
  const checked = YunoBallEnrichmentSchema.safeParse(enrichment);
  if (!checked.success) {
    console.error("ingest:yunoball FAILED validation");
    console.error(JSON.stringify(checked.error.issues, null, 2));
    process.exit(1);
  }

  await writeFile(outPath, `${JSON.stringify(checked.data, null, 2)}\n`, "utf8");

  if (checked.data.meta.status === "skipped") {
    console.log(
      `ingest:yunoball SKIPPED — ${checked.data.meta.reason} (curated/local build may continue)`,
    );
    console.log(`  wrote ${path.relative(root, outPath)}`);
    return;
  }

  console.log(
    `ingest:yunoball OK — ${checked.data.meta.teamCount} teams, export ${checked.data.meta.exportVersion}`,
  );
  console.log(`  asOf=${checked.data.meta.asOf} retrievedAt=${checked.data.meta.retrievedAt}`);
  console.log(`  wrote ${path.relative(root, outPath)}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
