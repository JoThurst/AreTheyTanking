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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = path.join(root, "data", "league-snapshot.json");

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  if (!(await exists(snapshotPath))) {
    console.log(
      "validate:data — data/league-snapshot.json not found yet (ATT-003). Schema module loads OK.",
    );
    return;
  }

  const raw = JSON.parse(await readFile(snapshotPath, "utf8")) as unknown;
  const result = LeagueSnapshotSchema.safeParse(raw);
  if (!result.success) {
    console.error("validate:data FAILED");
    console.error(JSON.stringify(result.error.issues, null, 2));
    process.exit(1);
  }

  console.log(
    `validate:data OK — ${result.data.teams.length} teams, methodology ${result.data.meta.methodologyVersion}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
