import { describe, expect, it } from "vitest";
import { formatDelta, formatScore, teamHref } from "../src/lib/format";
import { getAllTeams } from "../src/lib/loadSnapshot";

describe("league grid data presentation", () => {
  it("loads exactly 30 teams with stable routes", () => {
    const teams = getAllTeams();
    expect(teams).toHaveLength(30);
    for (const team of teams) {
      expect(teamHref(team)).toBe(`/team/${team.identity.slug}/`);
      expect(team.summary.length).toBeGreaterThan(0);
    }
  });

  it("keeps high tank scores readable alongside low confidence", () => {
    const utah = getAllTeams().find((t) => t.teamId === "UTA");
    expect(utah).toBeDefined();
    expect(formatScore(utah!.tankScore)).toBe("72");
    expect(utah!.confidence).toBe("low");
    expect(utah!.scoreBand).toBe("Tank Watch");
    expect(formatScore(utah!.teamStrength)).toBe("28");
  });

  it("formats unknown deltas without implying zero movement", () => {
    expect(formatDelta("unknown")).toBe("Δ unknown");
    expect(formatDelta(4)).toBe("Δ +4");
    expect(formatDelta(-2)).toBe("Δ -2");
  });

  it("distinguishes strength labels from tank score bands in seed", () => {
    const trying = getAllTeams().find(
      (t) =>
        typeof t.teamStrength === "number" &&
        t.teamStrength < 45 &&
        typeof t.tankScore === "number" &&
        t.tankScore < 40,
    );
    // San Antonio: mid strength / mid tank — still distinct measures
    const spurs = getAllTeams().find((t) => t.teamId === "SAS");
    expect(spurs?.teamStrength).not.toBe(spurs?.tankScore);
    expect(trying === undefined || trying.teamStrength !== trying.tankScore).toBe(true);
  });
});
