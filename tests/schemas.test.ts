import { describe, expect, it } from "vitest";
import {
  EvidenceItemSchema,
  EditorialOverrideSchema,
  LeagueSnapshotSchema,
  TeamSummarySchema,
} from "../src/schemas";
import { TEAM_IDS } from "../src/data/teamIds";
import {
  buildMinimalSnapshot,
  evidenceTierA,
  evidenceTierB,
  evidenceTierC,
  evidenceTierD,
  sampleOverride,
  sampleTeam,
} from "./fixtures/schemaFixtures";

describe("canonical team IDs", () => {
  it("has exactly 30 unique franchise IDs", () => {
    expect(TEAM_IDS).toHaveLength(30);
    expect(new Set(TEAM_IDS).size).toBe(30);
  });
});

describe("TeamSummarySchema", () => {
  it("accepts a valid representative team", () => {
    const result = TeamSummarySchema.safeParse(sampleTeam);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const { summary: _summary, ...incomplete } = sampleTeam;
    const result = TeamSummarySchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects invalid team IDs", () => {
    const result = TeamSummarySchema.safeParse({ ...sampleTeam, teamId: "XYZ" });
    expect(result.success).toBe(false);
  });

  it("rejects out-of-bounds scores", () => {
    const result = TeamSummarySchema.safeParse({ ...sampleTeam, tankScore: 101 });
    expect(result.success).toBe(false);
  });

  it("allows unknown instead of fabricating zero", () => {
    const result = TeamSummarySchema.safeParse({
      ...sampleTeam,
      competitiveIntent: "unknown",
      scoreDelta7d: "unknown",
    });
    expect(result.success).toBe(true);
  });
});

describe("EvidenceItemSchema", () => {
  it("accepts one item from each tier", () => {
    expect(EvidenceItemSchema.safeParse(evidenceTierA).success).toBe(true);
    expect(EvidenceItemSchema.safeParse(evidenceTierB).success).toBe(true);
    expect(EvidenceItemSchema.safeParse(evidenceTierC).success).toBe(true);
    expect(EvidenceItemSchema.safeParse(evidenceTierD).success).toBe(true);
  });

  it("rejects Tier D accepted_scoring evidence", () => {
    const result = EvidenceItemSchema.safeParse({
      ...evidenceTierD,
      status: "accepted_scoring",
      scoreComponent: "deployment_anomaly",
    });
    expect(result.success).toBe(false);
  });
});

describe("EditorialOverrideSchema", () => {
  it("accepts a valid override", () => {
    expect(EditorialOverrideSchema.safeParse(sampleOverride).success).toBe(true);
  });
});

describe("LeagueSnapshotSchema", () => {
  it("accepts a valid 30-team snapshot", () => {
    const result = LeagueSnapshotSchema.safeParse(buildMinimalSnapshot());
    expect(result.success).toBe(true);
  });

  it("rejects snapshots with fewer than 30 teams", () => {
    const snapshot = buildMinimalSnapshot();
    snapshot.teams = snapshot.teams.slice(0, 29);
    const result = LeagueSnapshotSchema.safeParse(snapshot);
    expect(result.success).toBe(false);
  });
});
