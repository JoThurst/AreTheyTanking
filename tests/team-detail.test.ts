import { describe, expect, it } from "vitest";
import { getAllTeams } from "../src/lib/loadSnapshot";
import { formatScore } from "../src/lib/format";
import { LeagueSnapshotSchema } from "../src/schemas";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("team detail readiness", () => {
  it("builds explanations and unknown-safe values for every team", () => {
    for (const team of getAllTeams()) {
      expect(team.components.length).toBeGreaterThan(0);
      for (const component of team.components) {
        expect(component.explanation.length).toBeGreaterThan(10);
      }
      if (team.competitiveIntent === "unknown") {
        expect(formatScore(team.competitiveIntent)).toBe("unknown");
      }
      if (team.pickContext) {
        expect(team.pickContext.verificationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});

describe("invalid snapshot rejection", () => {
  it("fails validation when team count is wrong", () => {
    const snapshotPath = path.join(process.cwd(), "data", "league-snapshot.json");
    const raw = JSON.parse(readFileSync(snapshotPath, "utf8")) as {
      teams: unknown[];
      meta: unknown;
      evidence: unknown[];
      overrides: unknown[];
    };
    raw.teams = raw.teams.slice(0, 5);
    const result = LeagueSnapshotSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });
});
