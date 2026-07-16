import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  MARKET_CONTEXT_DISCLAIMER,
  YunoBallEnrichmentSchema,
} from "../src/pipeline/yunoballSchemas";
import { YunoBallExportAdapter } from "../src/pipeline/yunoballAdapter";

const fixturesRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "yunoball",
);

const tempDirs: string[] = [];

async function makeTempRoot(): Promise<{ cacheRoot: string; workRoot: string }> {
  const workRoot = await mkdtemp(path.join(tmpdir(), "att-yunoball-"));
  tempDirs.push(workRoot);
  const cacheRoot = path.join(workRoot, "cache");
  await mkdir(cacheRoot, { recursive: true });
  return { cacheRoot, workRoot };
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("YunoBallExportAdapter", () => {
  it("skips gracefully when the sanitized artifact is absent", async () => {
    const { cacheRoot, workRoot } = await makeTempRoot();
    const adapter = new YunoBallExportAdapter({
      exportPath: path.join(workRoot, "missing-export.json"),
      cacheRoot,
      retrievedAt: "2026-07-16T18:00:00.000Z",
      required: false,
    });

    const result = await adapter.ingest();
    expect(result.meta.status).toBe("skipped");
    expect(result.meta.reason).toBe("artifact_absent");
    expect(result.teams).toHaveLength(0);
    expect(YunoBallEnrichmentSchema.safeParse(result).success).toBe(true);
  });

  it("applies a sanitized export deterministically for a fixed snapshot", async () => {
    const { cacheRoot } = await makeTempRoot();
    const exportPath = path.join(fixturesRoot, "sanitized-export.json");

    const adapter = new YunoBallExportAdapter({
      exportPath,
      cacheRoot,
      retrievedAt: "2026-07-16T18:00:00.000Z",
    });

    const first = await adapter.ingest();
    const second = await adapter.ingest();

    expect(first.meta.status).toBe("applied");
    expect(first.teams.map((t) => t.teamId)).toEqual(["BOS", "UTA"]);
    expect(first.teams[0]?.marketContext?.role).toBe("market_context");
    expect(first.teams[0]?.marketContext?.disclaimer).toBe(MARKET_CONTEXT_DISCLAIMER);
    expect(first.teams[1]?.marketContext?.disclaimer).toBe(MARKET_CONTEXT_DISCLAIMER);

    const hash = (value: unknown) =>
      createHash("sha256").update(JSON.stringify(value)).digest("hex");
    expect(hash(first)).toBe(hash(second));
  });

  it("fails loudly on corrupt export JSON when the file exists", async () => {
    const { cacheRoot, workRoot } = await makeTempRoot();
    const badPath = path.join(workRoot, "bad.json");
    await writeFile(badPath, "{not-json", "utf8");

    const adapter = new YunoBallExportAdapter({
      exportPath: badPath,
      cacheRoot,
      retrievedAt: "2026-07-16T18:00:00.000Z",
    });

    await expect(adapter.ingest()).rejects.toMatchObject({
      name: "CoreStatAdapterError",
      step: "retrieve",
    });
  });

  it("does not require credentials or connection strings", async () => {
    const source = await import("../src/pipeline/yunoballAdapter");
    const text = await (
      await import("node:fs/promises")
    ).readFile(new URL("../src/pipeline/yunoballAdapter.ts", import.meta.url), "utf8");
    expect(text).not.toMatch(
      /connectionString|process\.env|postgres:\/\/|mongodb:\/\/|mysql:\/\//i,
    );
    expect(text).toMatch(/local JSON artifact only/);
    expect(source.YunoBallExportAdapter).toBeTypeOf("function");
  });
});
