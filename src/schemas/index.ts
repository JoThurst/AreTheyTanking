import { z } from "zod";
import { TEAM_IDS } from "../data/teamIds";

/** Score 0–100, or explicit unknown (never coerce missing to 0). */
export const ScoreValueSchema = z.union([z.number().int().min(0).max(100), z.literal("unknown")]);

export const OperatingModeSchema = z.enum(["offseason", "regular_season", "late_season"]);

export const CompetitiveStateSchema = z.enum([
  "Contender",
  "Playoff Push",
  "Play-In Fight",
  "Crossroads",
  "Development Season",
  "Rebuilding",
  "Tank Watch",
  "Confirmed League Action",
]);

export const ScoreBandSchema = z.enum([
  "Full Competition",
  "Competitive",
  "Direction Unclear",
  "Tank Watch",
  "Strong Tank Signal",
]);

export const ConfidenceSchema = z.enum(["low", "medium", "high"]);

export const EvidenceTierSchema = z.enum(["A", "B", "C", "D"]);

export const EvidenceStatusSchema = z.enum([
  "discovered",
  "needs_review",
  "accepted_context",
  "accepted_scoring",
  "rejected",
  "superseded",
]);

export const ScoreComponentKeySchema = z.enum([
  "deployment_anomaly",
  "roster_deprioritization",
  "performance_divergence",
  "draft_incentive",
  "official_action_signal",
  "team_strength",
  "competitive_intent",
  "tank_score",
]);

export const TeamIdSchema = z.enum(TEAM_IDS);

export const IsoDateTimeSchema = z.iso.datetime({
  offset: true,
  error: "Must be an ISO-8601 datetime with timezone",
});

export const IsoDateSchema = z.iso.date();

export const SourceSchema = z.object({
  name: z.string().min(1),
  url: z.url().optional(),
  author: z.string().min(1).optional(),
  publishedAt: IsoDateTimeSchema.optional(),
  retrievedAt: IsoDateTimeSchema,
});

export const RecordSchema = z.object({
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
});

export const ScoreComponentSchema = z.object({
  key: ScoreComponentKeySchema,
  value: ScoreValueSchema,
  label: z.string().min(1),
  explanation: z.string().min(1),
});

export const PickContextSchema = z.object({
  summary: z.string().min(1),
  ownsPick: z.boolean().nullable(),
  protections: z.string().nullable(),
  verificationDate: IsoDateSchema,
  sources: z.array(SourceSchema).default([]),
});

export const EvidenceItemSchema = z
  .object({
    id: z.string().min(1),
    teamIds: z.array(TeamIdSchema).min(1),
    title: z.string().min(1),
    claimSummary: z.string().min(1),
    tier: EvidenceTierSchema,
    status: EvidenceStatusSchema,
    eventDate: IsoDateSchema,
    discoveredAt: IsoDateTimeSchema,
    source: SourceSchema,
    scoreComponent: ScoreComponentKeySchema.nullable(),
    effectiveAt: IsoDateTimeSchema.nullable(),
    expiresAt: IsoDateTimeSchema.nullable(),
    corroboratingIds: z.array(z.string()).default([]),
    reviewerNote: z.string().nullable(),
  })
  .superRefine((item, ctx) => {
    if (item.tier === "D" && item.status === "accepted_scoring") {
      ctx.addIssue({
        code: "custom",
        message: "Tier D evidence cannot be accepted for scoring",
        path: ["status"],
      });
    }
    if (item.status === "accepted_scoring" && item.scoreComponent === null) {
      ctx.addIssue({
        code: "custom",
        message: "accepted_scoring evidence requires scoreComponent",
        path: ["scoreComponent"],
      });
    }
  });

export const EditorialOverrideSchema = z.object({
  id: z.string().min(1),
  teamId: TeamIdSchema,
  field: ScoreComponentKeySchema,
  originalValue: ScoreValueSchema,
  publishedValue: ScoreValueSchema,
  reason: z.string().min(1),
  supportingEvidenceIds: z.array(z.string()).default([]),
  author: z.string().min(1),
  createdAt: IsoDateTimeSchema,
  reviewBy: IsoDateTimeSchema,
});

export const DraftClassAssessmentSchema = z.object({
  draftYear: z.number().int().min(2000).max(2100),
  indexScore: ScoreValueSchema,
  confidence: ConfidenceSchema,
  topProspectTierCount: z.number().int().min(0).nullable(),
  lotteryQualityTierCount: z.number().int().min(0).nullable(),
  summary: z.string().min(1),
  lotteryRuleMode: z.string().min(1),
  sources: z.array(SourceSchema).min(1),
  reviewedAt: IsoDateTimeSchema,
  changeSincePrior: z.string().nullable(),
});

export const TeamIdentitySchema = z.object({
  teamId: TeamIdSchema,
  name: z.string().min(1),
  abbreviation: TeamIdSchema,
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  conference: z.enum(["East", "West"]),
  division: z.enum(["Atlantic", "Central", "Southeast", "Northwest", "Pacific", "Southwest"]),
  city: z.string().min(1),
});

export const TeamSummarySchema = z.object({
  teamId: TeamIdSchema,
  season: z.string().min(1),
  mode: OperatingModeSchema,
  competitiveState: CompetitiveStateSchema,
  tankScore: ScoreValueSchema,
  scoreBand: ScoreBandSchema,
  confidence: ConfidenceSchema,
  teamStrength: ScoreValueSchema,
  draftIncentive: ScoreValueSchema,
  competitiveIntent: ScoreValueSchema,
  record: RecordSchema,
  recentForm: z
    .object({
      last10Wins: z.number().int().min(0).max(10).nullable(),
      last10Losses: z.number().int().min(0).max(10).nullable(),
      label: z.string().min(1),
    })
    .nullable(),
  scoreDelta7d: z.union([z.number().int(), z.literal("unknown")]),
  summary: z.string().min(1),
  components: z.array(ScoreComponentSchema).default([]),
  pickContext: PickContextSchema.nullable(),
  evidenceIds: z.array(z.string()).default([]),
  updatedAt: IsoDateTimeSchema,
  sourceRetrievedAt: IsoDateTimeSchema.nullable(),
  methodologyVersion: z.string().min(1),
  stale: z.boolean().default(false),
  identity: TeamIdentitySchema,
});

export const LeagueSnapshotMetaSchema = z.object({
  season: z.string().min(1),
  mode: OperatingModeSchema,
  generatedAt: IsoDateTimeSchema,
  methodologyVersion: z.string().min(1),
  stale: z.boolean().default(false),
  lastSuccessfulUpdateAt: IsoDateTimeSchema,
  draftAssessment: DraftClassAssessmentSchema.nullable(),
});

export const LeagueSnapshotSchema = z
  .object({
    meta: LeagueSnapshotMetaSchema,
    teams: z.array(TeamSummarySchema),
    evidence: z.array(EvidenceItemSchema).default([]),
    overrides: z.array(EditorialOverrideSchema).default([]),
  })
  .superRefine((snapshot, ctx) => {
    const ids = snapshot.teams.map((t) => t.teamId);
    const unique = new Set(ids);
    if (ids.length !== 30) {
      ctx.addIssue({
        code: "custom",
        message: `Expected exactly 30 teams, got ${ids.length}`,
        path: ["teams"],
      });
    }
    if (unique.size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate teamId in snapshot",
        path: ["teams"],
      });
    }
    const slugs = snapshot.teams.map((t) => t.identity.slug);
    if (new Set(slugs).size !== slugs.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate team slug in snapshot",
        path: ["teams"],
      });
    }
    for (const team of snapshot.teams) {
      if (team.identity.teamId !== team.teamId) {
        ctx.addIssue({
          code: "custom",
          message: `identity.teamId ${team.identity.teamId} must match teamId ${team.teamId}`,
          path: ["teams"],
        });
      }
      if (team.identity.abbreviation !== team.teamId) {
        ctx.addIssue({
          code: "custom",
          message: `identity.abbreviation must equal teamId for ${team.teamId}`,
          path: ["teams"],
        });
      }
    }
  });

export type ScoreValue = z.infer<typeof ScoreValueSchema>;
export type OperatingMode = z.infer<typeof OperatingModeSchema>;
export type CompetitiveState = z.infer<typeof CompetitiveStateSchema>;
export type ScoreBand = z.infer<typeof ScoreBandSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
export type EvidenceTier = z.infer<typeof EvidenceTierSchema>;
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type EditorialOverride = z.infer<typeof EditorialOverrideSchema>;
export type DraftClassAssessment = z.infer<typeof DraftClassAssessmentSchema>;
export type TeamIdentity = z.infer<typeof TeamIdentitySchema>;
export type TeamSummary = z.infer<typeof TeamSummarySchema>;
export type LeagueSnapshot = z.infer<typeof LeagueSnapshotSchema>;
export type LeagueSnapshotMeta = z.infer<typeof LeagueSnapshotMetaSchema>;
export type ScoreComponent = z.infer<typeof ScoreComponentSchema>;
export type PickContext = z.infer<typeof PickContextSchema>;
