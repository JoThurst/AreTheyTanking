import { z } from "zod";
import { IsoDateTimeSchema, TeamIdSchema } from "../schemas";

/**
 * Sanitized YunoBall export contract.
 * This is a file-only input — never a live database row shape.
 */

export const MARKET_CONTEXT_DISCLAIMER =
  "Market-implied expectations are context only; not proof of competitive intent and not a Tank Score input.";

export const YunoBallMarketContextSchema = z.object({
  role: z.literal("market_context"),
  disclaimer: z.literal(MARKET_CONTEXT_DISCLAIMER),
  /** Optional implied team win probability 0–1 from closing/market lines. */
  impliedWinProbability: z.number().min(0).max(1).nullable(),
  /** Optional market-implied spread (team perspective). */
  impliedSpread: z.number().nullable(),
  asOf: IsoDateTimeSchema,
});

export const YunoBallTeamExportSchema = z.object({
  teamId: TeamIdSchema,
  gamesPlayed: z.number().int().min(0).nullable(),
  wins: z.number().int().min(0).nullable(),
  losses: z.number().int().min(0).nullable(),
  netRating: z.number().nullable(),
  offensiveRating: z.number().nullable(),
  defensiveRating: z.number().nullable(),
  scheduleFactor: z.number().nullable(),
  dailyMetricFlags: z.array(z.string().min(1)).default([]),
  marketContext: YunoBallMarketContextSchema.nullable(),
});

export const YunoBallSanitizedExportSchema = z.object({
  exportVersion: z.string().min(1),
  sourceLabel: z.literal("yunoball-sanitized"),
  season: z.string().min(1),
  /** When the sanitized file was produced. */
  exportedAt: IsoDateTimeSchema,
  /** Metrics as-of time (distinct from export wall clock). */
  asOf: IsoDateTimeSchema,
  teams: z.array(YunoBallTeamExportSchema),
});

export const YunoBallEnrichmentMetaSchema = z.object({
  status: z.enum(["applied", "skipped"]),
  reason: z.string().min(1).nullable(),
  sourceLabel: z.string().min(1),
  exportVersion: z.string().nullable(),
  retrievedAt: IsoDateTimeSchema,
  asOf: IsoDateTimeSchema.nullable(),
  teamCount: z.number().int().min(0).max(30),
});

export const YunoBallEnrichmentSchema = z.object({
  meta: YunoBallEnrichmentMetaSchema,
  teams: z.array(YunoBallTeamExportSchema),
});

export type YunoBallMarketContext = z.infer<typeof YunoBallMarketContextSchema>;
export type YunoBallTeamExport = z.infer<typeof YunoBallTeamExportSchema>;
export type YunoBallSanitizedExport = z.infer<typeof YunoBallSanitizedExportSchema>;
export type YunoBallEnrichment = z.infer<typeof YunoBallEnrichmentSchema>;
