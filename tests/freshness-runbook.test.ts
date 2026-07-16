import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  formatCoreStatsFreshnessLog,
  formatPipelineStatusLog,
  formatSnapshotFreshnessLog,
} from "../src/pipeline/freshnessLog";
import { NormalizedCoreStatsSchema } from "../src/pipeline/schemas";
import { PipelineStatusSchema } from "../src/pipeline/pipelineStatus";
import { LeagueSnapshotSchema } from "../src/schemas";
import { buildMinimalSnapshot, sampleTeam } from "./fixtures/schemaFixtures";
import { TEAM_IDS } from "../src/data/teamIds";

describe("pipeline runbook", () => {
  it("documents normal, manual, failure, and rollback paths plus editorial ownership", () => {
    const runbook = readFileSync(path.join(process.cwd(), "docs/PIPELINE_RUNBOOK.md"), "utf8");
    expect(runbook).toMatch(/Normal scheduled run/i);
    expect(runbook).toMatch(/Manual rerun/i);
    expect(runbook).toMatch(/Source failure/i);
    expect(runbook).toMatch(/Invalid data/i);
    expect(runbook).toMatch(/Rollback to last-known-good/i);
    expect(runbook).toMatch(/Ownership/i);
    expect(runbook).toMatch(/editorial-snapshot/i);
    expect(runbook).toMatch(/does \*\*not\*\* show workflow names/i);
  });
});

describe("freshness logs", () => {
  it("include source freshness and team-count summaries without secret-like material", () => {
    const core = NormalizedCoreStatsSchema.parse({
      meta: {
        sourceName: "fixture-core-stats:mock",
        sourceKind: "fixture",
        season: "2025-26",
        retrievedAt: "2026-07-16T18:00:00.000Z",
        asOf: "2026-04-13T04:00:00.000Z",
        teamCount: 1,
      },
      teams: [
        {
          teamId: "UTA",
          record: { wins: 17, losses: 65 },
          recentForm: { last10Wins: 1, last10Losses: 9, label: "1-9" },
          netRating: -9.8,
          conferenceRank: 15,
          schedule: { gamesPlayed: 82, nextGameDate: null },
          sourceRetrievedAt: "2026-07-16T18:00:00.000Z",
          asOf: "2026-04-13T04:00:00.000Z",
        },
      ],
    });

    const coreLog = formatCoreStatsFreshnessLog(core);
    expect(coreLog).toContain("teams=1");
    expect(coreLog).toContain("asOf=2026-04-13T04:00:00.000Z");
    expect(coreLog).not.toMatch(/password|secret|postgres:\/\//i);

    const snapshot = LeagueSnapshotSchema.parse({
      ...buildMinimalSnapshot(),
      teams: TEAM_IDS.map((teamId) => ({
        ...sampleTeam,
        teamId,
        identity: {
          ...sampleTeam.identity,
          teamId,
          abbreviation: teamId,
          slug: `${teamId.toLowerCase()}-team`,
          name: `${teamId} Team`,
          city: teamId,
        },
      })),
    });
    const snapLog = formatSnapshotFreshnessLog(snapshot);
    expect(snapLog).toContain("public-teams=30");
    expect(snapLog).toContain("lastSuccessfulUpdateAt=");

    const status = PipelineStatusSchema.parse({
      status: "failed",
      stale: true,
      lastSuccessfulUpdateAt: "2026-07-16T14:00:00.000Z",
      lastAttemptAt: "2026-07-16T20:00:00.000Z",
      failure: { source: "fixture-core-stats", step: "retrieve", message: "upstream timeout" },
    });
    expect(formatPipelineStatusLog(status)).toContain("failure=fixture-core-stats/retrieve");
  });
});

describe("site stale surface", () => {
  it("exposes stale status without infrastructure detail in the banner component", () => {
    const banner = readFileSync(
      path.join(process.cwd(), "src/components/StaleBanner.astro"),
      "utf8",
    );
    expect(banner).toContain("Stale data");
    expect(banner).toContain("lastSuccessfulUpdateAt");
    expect(banner).not.toContain("pipeline-status");
    expect(banner).not.toContain("workflow");
    expect(banner).not.toContain("GITHUB_TOKEN");
    expect(banner).not.toContain("failure.source");
  });

  it("keeps pipeline-status available for operators while site overlay only flips stale", () => {
    expect(existsSync(path.join(process.cwd(), "data/pipeline-status.json"))).toBe(true);
    const loadSnapshot = readFileSync(path.join(process.cwd(), "src/lib/loadSnapshot.ts"), "utf8");
    expect(loadSnapshot).toContain("applyPipelineOverlay");
    expect(loadSnapshot).toContain("status.stale");
    expect(loadSnapshot).not.toContain("failure.message");
  });
});
