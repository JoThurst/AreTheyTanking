import { mkdtemp, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, afterEach } from "vitest";
import { TEAM_IDS } from "../src/data/teamIds";
import {
  CoreStatAdapterError,
  FixtureCoreStatAdapter,
  NormalizedCoreStatsSchema,
  TeamIdMappingError,
  mapProviderTeamId,
} from "../src/pipeline";

const fixturesRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "core-stats",
);

const tempDirs: string[] = [];

async function makeCacheRoot(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "att-core-stats-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("mapProviderTeamId", () => {
  it("maps canonical, alias, and numeric provider keys", () => {
    expect(mapProviderTeamId("UTA")).toBe("UTA");
    expect(mapProviderTeamId("CHO")).toBe("CHA");
    expect(mapProviderTeamId("BRK")).toBe("BKN");
    expect(mapProviderTeamId(1610612762)).toBe("UTA");
  });

  it("fails loudly on unknown keys", () => {
    expect(() => mapProviderTeamId("NOTATEAM")).toThrow(TeamIdMappingError);
    expect(() => mapProviderTeamId("")).toThrow(TeamIdMappingError);
  });
});

describe("FixtureCoreStatAdapter", () => {
  it("produces schema-valid normalized output for all 30 teams without network", async () => {
    const cacheRoot = await makeCacheRoot();
    const adapter = new FixtureCoreStatAdapter({
      fixturePath: path.join(fixturesRoot, "provider-all-30.json"),
      cacheRoot,
      retrievedAt: "2026-07-16T18:00:00.000Z",
      requireAllTeams: true,
    });

    const result = await adapter.ingest();
    const validated = NormalizedCoreStatsSchema.safeParse(result);
    expect(validated.success).toBe(true);
    expect(result.teams).toHaveLength(30);
    expect(new Set(result.teams.map((t) => t.teamId))).toEqual(new Set(TEAM_IDS));

    // Provider aliases resolved to canonical IDs
    expect(result.teams.find((t) => t.teamId === "CHA")?.record).toEqual({
      wins: 19,
      losses: 63,
    });
    expect(result.teams.find((t) => t.teamId === "BKN")?.record).toEqual({
      wins: 26,
      losses: 56,
    });
    expect(result.teams.find((t) => t.teamId === "GSW")?.netRating).toBe(2.8);

    // Source / retrieved / as-of are distinct
    expect(result.meta.retrievedAt).toBe("2026-07-16T18:00:00.000Z");
    expect(result.meta.asOf).toBe("2026-04-13T04:00:00.000Z");
    expect(result.meta.retrievedAt).not.toBe(result.meta.asOf);
    expect(result.meta.sourceName).toContain("mock-nba-standings");
  });

  it("represents unavailable fields as null rather than zero", async () => {
    const cacheRoot = await makeCacheRoot();
    const adapter = new FixtureCoreStatAdapter({
      fixturePath: path.join(fixturesRoot, "provider-partial-unavailable.json"),
      cacheRoot,
      retrievedAt: "2026-07-16T18:00:00.000Z",
    });

    const result = await adapter.ingest();
    const bos = result.teams.find((t) => t.teamId === "BOS");
    expect(bos).toBeDefined();
    expect(bos?.record).toBeNull();
    expect(bos?.recentForm).toBeNull();
    expect(bos?.netRating).toBeNull();
    expect(bos?.conferenceRank).toBeNull();

    const uta = result.teams.find((t) => t.teamId === "UTA");
    expect(uta?.netRating).toBeNull();
    expect(uta?.record).toEqual({ wins: 10, losses: 30 });
  });

  it("fails loudly on unmapped provider team ids", async () => {
    const cacheRoot = await makeCacheRoot();
    const adapter = new FixtureCoreStatAdapter({
      fixturePath: path.join(fixturesRoot, "provider-unknown-team.json"),
      cacheRoot,
      retrievedAt: "2026-07-16T18:00:00.000Z",
    });

    await expect(adapter.ingest()).rejects.toMatchObject({
      name: "CoreStatAdapterError",
      step: "map",
    } satisfies Partial<CoreStatAdapterError>);
  });

  it("caches the raw provider payload for reproducibility", async () => {
    const cacheRoot = await makeCacheRoot();
    const adapter = new FixtureCoreStatAdapter({
      fixturePath: path.join(fixturesRoot, "provider-partial-unavailable.json"),
      cacheRoot,
      retrievedAt: "2026-07-16T18:00:00.000Z",
    });

    await adapter.ingest();
    const expected = path.join(cacheRoot, "fixture-core-stats", "2026-07-16T18-00-00-000Z.json");
    await expect(access(expected)).resolves.toBeUndefined();
  });
});

describe("UI isolation from provider shapes", () => {
  it("does not export provider payload types from public site loaders", async () => {
    const loadSnapshot = await import("../src/lib/loadSnapshot");
    expect(loadSnapshot.loadLeagueSnapshot).toBeTypeOf("function");
    // Provider schema lives only under pipeline; site loader stays snapshot-only.
    expect("ProviderCoreStatsPayloadSchema" in loadSnapshot).toBe(false);
  });
});
