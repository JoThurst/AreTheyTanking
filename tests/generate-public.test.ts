import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { LeagueSnapshotSchema } from "../src/schemas";
import { generatePublicSnapshot, stableStringify } from "../src/pipeline/generatePublicSnapshot";
import { FixtureCoreStatAdapter } from "../src/pipeline/fixtureAdapter";
import { PROTECTED_EDITORIAL_FIELDS } from "../src/pipeline/generationManifest";
import { buildMinimalSnapshot, sampleTeam } from "./fixtures/schemaFixtures";
import { TEAM_IDS } from "../src/data/teamIds";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

const fixturesRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "core-stats",
);

function fullEditorialSnapshot() {
  const base = buildMinimalSnapshot();
  const teams = TEAM_IDS.map((teamId, index) => ({
    ...sampleTeam,
    teamId,
    summary: `Editorial summary for ${teamId}`,
    competitiveState: sampleTeam.competitiveState,
    evidenceIds: index === 0 ? ["ev-keep"] : [],
    identity: {
      ...sampleTeam.identity,
      teamId,
      abbreviation: teamId,
      slug: `${teamId.toLowerCase()}-team`,
      name: `${teamId} Team`,
      city: teamId,
    },
    record: { wins: 0, losses: 0 },
    recentForm: null,
    sourceRetrievedAt: null,
  }));

  return LeagueSnapshotSchema.parse({
    ...base,
    teams,
    evidence: [
      {
        id: "ev-keep",
        teamIds: ["ATL"],
        title: "Keep me",
        claimSummary: "Editorial evidence must survive generation.",
        tier: "C",
        status: "accepted_context",
        eventDate: "2026-07-01",
        discoveredAt: "2026-07-02T12:00:00.000Z",
        source: { name: "Editorial", retrievedAt: "2026-07-02T12:00:00.000Z" },
        scoreComponent: null,
        effectiveAt: null,
        expiresAt: null,
        corroboratingIds: [],
        reviewerNote: null,
      },
    ],
    overrides: [
      {
        id: "ov-keep",
        teamId: "ATL",
        field: "tank_score",
        originalValue: 50,
        publishedValue: 55,
        reason: "Editorial override must survive generation.",
        supportingEvidenceIds: [],
        author: "owner",
        createdAt: "2026-07-02T12:00:00.000Z",
        reviewBy: "2026-08-01T12:00:00.000Z",
      },
    ],
  });
}

describe("generatePublicSnapshot", () => {
  it("merges automated facts without overwriting editorial fields", async () => {
    const cacheRoot = await mkdtemp(path.join(tmpdir(), "att-gen-"));
    try {
      const coreStats = await new FixtureCoreStatAdapter({
        fixturePath: path.join(fixturesRoot, "provider-all-30.json"),
        cacheRoot,
        retrievedAt: "2026-07-16T19:00:00.000Z",
        requireAllTeams: true,
      }).ingest();

      const editorial = fullEditorialSnapshot();
      const beforeSummaries = Object.fromEntries(editorial.teams.map((t) => [t.teamId, t.summary]));
      const beforeStates = Object.fromEntries(
        editorial.teams.map((t) => [t.teamId, t.competitiveState]),
      );

      const result = generatePublicSnapshot({
        editorial,
        coreStats,
        yunoball: null,
        generatedAt: "2026-07-16T19:05:00.000Z",
        paths: {
          editorialSnapshot: "data/league-snapshot.json",
          coreStats: "data/normalized-core-stats.json",
          yunoballEnrichment: "data/yunoball-enrichment.json",
        },
      });

      expect(result.snapshot.teams).toHaveLength(30);
      expect(LeagueSnapshotSchema.safeParse(result.snapshot).success).toBe(true);
      expect(result.manifest.teamCount).toBe(30);
      expect(result.manifest.methodologyVersion).toBe(editorial.meta.methodologyVersion);
      expect(result.manifest.protectedEditorialFields).toEqual([...PROTECTED_EDITORIAL_FIELDS]);

      const uta = result.snapshot.teams.find((t) => t.teamId === "UTA");
      expect(uta?.record).toEqual({ wins: 17, losses: 65 });
      expect(uta?.recentForm?.label).toBe("1-9");
      expect(uta?.sourceRetrievedAt).toBe("2026-07-16T19:00:00.000Z");
      expect(uta?.summary).toBe(beforeSummaries.UTA);
      expect(uta?.competitiveState).toBe(beforeStates.UTA);

      expect(result.snapshot.evidence.map((e) => e.id)).toEqual(["ev-keep"]);
      expect(result.snapshot.overrides.map((o) => o.id)).toEqual(["ov-keep"]);

      for (const team of result.snapshot.teams) {
        expect(team.summary).toBe(beforeSummaries[team.teamId]);
        expect(team.competitiveState).toBe(beforeStates[team.teamId]);
      }

      // Deterministic serialization
      const again = generatePublicSnapshot({
        editorial,
        coreStats,
        yunoball: null,
        generatedAt: "2026-07-16T19:05:00.000Z",
        paths: {
          editorialSnapshot: "data/league-snapshot.json",
          coreStats: "data/normalized-core-stats.json",
          yunoballEnrichment: "data/yunoball-enrichment.json",
        },
      });
      expect(again.serializedSnapshot).toBe(result.serializedSnapshot);
      expect(again.serializedManifest).toBe(result.serializedManifest);
      expect(createHash("sha256").update(result.serializedSnapshot).digest("hex")).toBe(
        createHash("sha256").update(again.serializedSnapshot).digest("hex"),
      );
    } finally {
      await rm(cacheRoot, { recursive: true, force: true });
    }
  });

  it("validates before returning and keeps stable key ordering", () => {
    const editorial = fullEditorialSnapshot();
    const result = generatePublicSnapshot({
      editorial,
      coreStats: null,
      yunoball: null,
      generatedAt: "2026-07-16T19:05:00.000Z",
      paths: {
        editorialSnapshot: "data/league-snapshot.json",
        coreStats: "data/normalized-core-stats.json",
        yunoballEnrichment: "data/yunoball-enrichment.json",
      },
    });

    expect(result.snapshot.teams.map((t) => t.teamId)).toEqual([...TEAM_IDS].sort());
    expect(result.serializedSnapshot).toBe(stableStringify(result.snapshot));
    expect(result.manifest.inputs.coreStats.present).toBe(false);
    expect(result.manifest.inputs.yunoballEnrichment.status).toBe("absent");
  });
});
