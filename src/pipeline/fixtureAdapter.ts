import { z } from "zod";
import { TEAM_IDS } from "../data/teamIds";
import { IsoDateTimeSchema } from "../schemas";
import { CoreStatAdapterError, type CoreStatSourceAdapter } from "./adapter";
import { writeRawCache } from "./cache";
import {
  NormalizedCoreStatsSchema,
  type NormalizedCoreStats,
  type NormalizedCoreTeam,
} from "./schemas";
import { TeamIdMappingError, mapProviderTeamId } from "./teamIdMap";

/**
 * Provider-shaped fixture payload (intentionally different from NormalizedCoreStats).
 * Tests and local ingest use this shape; UI must never import it.
 */
export const ProviderTeamRowSchema = z.object({
  provider_team_key: z.union([z.string(), z.number()]),
  wins: z.number().int().nullable().optional(),
  losses: z.number().int().nullable().optional(),
  last_10: z.string().nullable().optional(),
  net_rating: z.number().nullable().optional(),
  conf_rank: z.number().int().nullable().optional(),
  games_played: z.number().int().nullable().optional(),
  next_game: z.string().nullable().optional(),
});

export const ProviderCoreStatsPayloadSchema = z.object({
  provider: z.string().min(1),
  season_label: z.string().min(1),
  /** Provider's notion of standings effective time. */
  standings_as_of: IsoDateTimeSchema,
  teams: z.array(ProviderTeamRowSchema).min(1),
});

export type ProviderCoreStatsPayload = z.infer<typeof ProviderCoreStatsPayloadSchema>;
export type ProviderTeamRow = z.infer<typeof ProviderTeamRowSchema>;

export interface FixtureAdapterOptions {
  /** Absolute or process-cwd-relative path to provider JSON. */
  fixturePath: string;
  /** Directory for raw cache writes. */
  cacheRoot: string;
  /** Override wall-clock retrieval time (tests). */
  retrievedAt?: string;
  /** When true, require all 30 franchise IDs to be present. Default false (available teams only). */
  requireAllTeams?: boolean;
}

function parseLast10(label: string | null | undefined): NormalizedCoreTeam["recentForm"] {
  if (label == null || label.trim() === "") return null;
  const match = /^(\d+)\s*[-–]\s*(\d+)$/.exec(label.trim());
  if (!match) {
    throw new CoreStatAdapterError(
      `Invalid last_10 form "${label}"; expected W-L like "3-7"`,
      "normalize",
    );
  }
  const last10Wins = Number(match[1]);
  const last10Losses = Number(match[2]);
  if (last10Wins + last10Losses > 10) {
    throw new CoreStatAdapterError(
      `Invalid last_10 form "${label}"; wins+losses must be <= 10`,
      "normalize",
    );
  }
  return {
    last10Wins,
    last10Losses,
    label: `${last10Wins}-${last10Losses}`,
  };
}

function normalizeRow(row: ProviderTeamRow, retrievedAt: string, asOf: string): NormalizedCoreTeam {
  let teamId;
  try {
    teamId = mapProviderTeamId(row.provider_team_key, "fixture-adapter");
  } catch (error) {
    if (error instanceof TeamIdMappingError) {
      throw new CoreStatAdapterError(error.message, "map");
    }
    throw error;
  }

  const wins = row.wins ?? null;
  const losses = row.losses ?? null;
  let record: NormalizedCoreTeam["record"] = null;
  if (wins != null && losses != null) {
    record = { wins, losses };
  } else if (wins != null || losses != null) {
    throw new CoreStatAdapterError(
      `Team ${teamId}: wins and losses must both be present or both unavailable`,
      "normalize",
    );
  }

  return {
    teamId,
    record,
    recentForm: parseLast10(row.last_10 ?? null),
    netRating: row.net_rating ?? null,
    conferenceRank: row.conf_rank ?? null,
    schedule: {
      gamesPlayed: row.games_played ?? null,
      nextGameDate: row.next_game ?? null,
    },
    sourceRetrievedAt: retrievedAt,
    asOf,
  };
}

/**
 * Fixture-backed adapter: loads a provider-shaped JSON file, caches the raw payload,
 * maps IDs, and emits NormalizedCoreStats. No network access.
 */
export class FixtureCoreStatAdapter implements CoreStatSourceAdapter {
  readonly sourceName: string;
  readonly sourceKind = "fixture" as const;

  constructor(private readonly options: FixtureAdapterOptions) {
    this.sourceName = "fixture-core-stats";
  }

  async ingest(): Promise<NormalizedCoreStats> {
    const { readFile } = await import("node:fs/promises");
    let rawText: string;
    try {
      rawText = await readFile(this.options.fixturePath, "utf8");
    } catch (error) {
      throw new CoreStatAdapterError(
        `Failed to read fixture at ${this.options.fixturePath}: ${String(error)}`,
        "retrieve",
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText) as unknown;
    } catch (error) {
      throw new CoreStatAdapterError(`Invalid JSON in fixture: ${String(error)}`, "retrieve");
    }

    const provider = ProviderCoreStatsPayloadSchema.safeParse(parsedJson);
    if (!provider.success) {
      throw new CoreStatAdapterError(
        `Provider fixture failed schema: ${JSON.stringify(provider.error.issues)}`,
        "retrieve",
      );
    }

    const retrievedAt = this.options.retrievedAt ?? new Date().toISOString();
    try {
      await writeRawCache(this.options.cacheRoot, this.sourceName, retrievedAt, provider.data);
    } catch (error) {
      throw new CoreStatAdapterError(`Failed to cache raw payload: ${String(error)}`, "cache");
    }

    const teams = provider.data.teams.map((row) =>
      normalizeRow(row, retrievedAt, provider.data.standings_as_of),
    );

    if (this.options.requireAllTeams) {
      const present = new Set(teams.map((t) => t.teamId));
      const missing = TEAM_IDS.filter((id) => !present.has(id));
      if (missing.length > 0) {
        throw new CoreStatAdapterError(
          `Fixture missing required teams: ${missing.join(", ")}`,
          "normalize",
        );
      }
    }

    const candidate: NormalizedCoreStats = {
      meta: {
        sourceName: `${this.sourceName}:${provider.data.provider}`,
        sourceKind: this.sourceKind,
        season: provider.data.season_label,
        retrievedAt,
        asOf: provider.data.standings_as_of,
        teamCount: teams.length,
      },
      teams,
    };

    const validated = NormalizedCoreStatsSchema.safeParse(candidate);
    if (!validated.success) {
      throw new CoreStatAdapterError(
        `Normalized output invalid: ${JSON.stringify(validated.error.issues)}`,
        "validate",
      );
    }
    return validated.data;
  }
}
