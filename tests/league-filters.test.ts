import { describe, expect, it } from "vitest";
import { getAllTeams } from "../src/lib/loadSnapshot";
import {
  applyLeagueFilters,
  filtersToSearch,
  parseFiltersFromSearch,
} from "../src/lib/leagueFilters";

describe("leagueFilters", () => {
  const teams = getAllTeams();

  it("sorts tank score descending with name tie-breaker", () => {
    const sorted = applyLeagueFilters(teams, {
      sort: "tankScore",
      conference: "all",
      state: "all",
      confidence: "all",
    });
    expect(sorted[0]?.teamId).toBe("UTA");
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = sorted[i - 1]!;
      const curr = sorted[i]!;
      const prevScore = prev.tankScore === "unknown" ? -1 : prev.tankScore;
      const currScore = curr.tankScore === "unknown" ? -1 : curr.tankScore;
      expect(prevScore).toBeGreaterThanOrEqual(currScore);
      if (prevScore === currScore) {
        expect(prev.identity.name.localeCompare(curr.identity.name)).toBeLessThanOrEqual(0);
      }
    }
  });

  it("combines conference and state filters", () => {
    const filtered = applyLeagueFilters(teams, {
      sort: "tankScore",
      conference: "West",
      state: "Rebuilding",
      confidence: "all",
    });
    expect(filtered.length).toBeGreaterThan(0);
    for (const team of filtered) {
      expect(team.identity.conference).toBe("West");
      expect(team.competitiveState).toBe("Rebuilding");
    }
  });

  it("round-trips supported URL state", () => {
    const filters = {
      sort: "confidence" as const,
      conference: "East" as const,
      state: "Contender" as const,
      confidence: "low" as const,
    };
    const search = filtersToSearch(filters);
    expect(search).toContain("sort=confidence");
    expect(parseFiltersFromSearch(search)).toEqual(filters);
  });
});
