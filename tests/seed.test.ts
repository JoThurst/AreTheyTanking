import { describe, expect, it } from "vitest";
import { TEAM_IDS } from "../src/data/teamIds";
import { SEED_TEAMS, assertSeedCoverage, scoreBandFor } from "../src/data/seedTeams";
import { LeagueSnapshotSchema } from "../src/schemas";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("seed dataset", () => {
  it("covers exactly the canonical 30 franchise IDs", () => {
    expect(SEED_TEAMS).toHaveLength(30);
    assertSeedCoverage(TEAM_IDS);
    const ids = SEED_TEAMS.map((t) => t.identity.teamId);
    expect(new Set(ids).size).toBe(30);
    const slugs = SEED_TEAMS.map((t) => t.identity.slug);
    expect(new Set(slugs).size).toBe(30);
    const abbreviations = SEED_TEAMS.map((t) => t.identity.abbreviation);
    expect(new Set(abbreviations).size).toBe(30);
  });

  it("uses unknown rather than fabricated zeros for offseason intent/delta", () => {
    for (const team of SEED_TEAMS) {
      expect(team.summary.length).toBeGreaterThan(20);
      expect(team.identity.name.length).toBeGreaterThan(0);
      expect(team.competitiveIntent).toBe("unknown");
    }
  });

  it("maps score bands consistently", () => {
    expect(scoreBandFor(10)).toBe("Full Competition");
    expect(scoreBandFor(72)).toBe("Tank Watch");
    expect(scoreBandFor(85)).toBe("Strong Tank Signal");
    expect(scoreBandFor("unknown")).toBe("Direction Unclear");
  });

  it("validates committed league-snapshot.json when present", () => {
    const snapshotPath = path.join(process.cwd(), "data", "league-snapshot.json");
    const raw = JSON.parse(readFileSync(snapshotPath, "utf8")) as unknown;
    const result = LeagueSnapshotSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.teams).toHaveLength(30);
      expect(result.data.evidence).toEqual([]);
      expect(result.data.meta.mode).toBe("offseason");
      for (const team of result.data.teams) {
        expect(team.summary.length).toBeGreaterThan(0);
        expect(team.competitiveIntent).toBe("unknown");
        expect(team.scoreDelta7d).toBe("unknown");
      }
    }
  });
});
