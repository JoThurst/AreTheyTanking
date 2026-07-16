import { z } from "zod";
import { IsoDateSchema, IsoDateTimeSchema, RecordSchema, TeamIdSchema } from "../schemas";

/**
 * Normalized core-stat contract produced by source adapters.
 * Provider-specific payload shapes must not appear here or in UI modules.
 */

export const CoreStatSourceKindSchema = z.enum(["fixture", "file", "http", "yunoball"]);

export const RecentFormSchema = z.object({
  last10Wins: z.number().int().min(0).max(10),
  last10Losses: z.number().int().min(0).max(10),
  label: z.string().min(1),
});

export const ScheduleContextSchema = z.object({
  gamesPlayed: z.number().int().min(0).nullable(),
  nextGameDate: IsoDateSchema.nullable(),
});

/**
 * Unavailable quantitative fields are null (or omitted via nullable),
 * never coerced to zero. Distinct timestamps: retrievedAt vs asOf.
 */
export const NormalizedCoreTeamSchema = z.object({
  teamId: TeamIdSchema,
  record: RecordSchema.nullable(),
  recentForm: RecentFormSchema.nullable(),
  netRating: z.number().nullable(),
  conferenceRank: z.number().int().min(1).max(15).nullable(),
  schedule: ScheduleContextSchema.nullable(),
  /** When this team's row was retrieved from the provider. */
  sourceRetrievedAt: IsoDateTimeSchema,
  /** Standings / performance as-of time (event time), distinct from retrieval. */
  asOf: IsoDateTimeSchema,
});

export const NormalizedCoreStatsMetaSchema = z.object({
  sourceName: z.string().min(1),
  sourceKind: CoreStatSourceKindSchema,
  season: z.string().min(1),
  /** Wall-clock time the adapter retrieved inputs. */
  retrievedAt: IsoDateTimeSchema,
  /** League-level as-of for the snapshot (standings effective time). */
  asOf: IsoDateTimeSchema,
  teamCount: z.number().int().min(0).max(30),
});

export const NormalizedCoreStatsSchema = z
  .object({
    meta: NormalizedCoreStatsMetaSchema,
    teams: z.array(NormalizedCoreTeamSchema),
  })
  .superRefine((snapshot, ctx) => {
    const ids = snapshot.teams.map((t) => t.teamId);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate teamId in normalized core stats",
        path: ["teams"],
      });
    }
    if (snapshot.meta.teamCount !== snapshot.teams.length) {
      ctx.addIssue({
        code: "custom",
        message: `meta.teamCount (${snapshot.meta.teamCount}) must equal teams.length (${snapshot.teams.length})`,
        path: ["meta", "teamCount"],
      });
    }
  });

export type RecentForm = z.infer<typeof RecentFormSchema>;
export type ScheduleContext = z.infer<typeof ScheduleContextSchema>;
export type NormalizedCoreTeam = z.infer<typeof NormalizedCoreTeamSchema>;
export type NormalizedCoreStatsMeta = z.infer<typeof NormalizedCoreStatsMetaSchema>;
export type NormalizedCoreStats = z.infer<typeof NormalizedCoreStatsSchema>;
export type CoreStatSourceKind = z.infer<typeof CoreStatSourceKindSchema>;
