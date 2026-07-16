import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { CoreStatAdapterError } from "./adapter";
import { writeRawCache } from "./cache";
import { mapProviderTeamId, TeamIdMappingError } from "./teamIdMap";
import {
  MARKET_CONTEXT_DISCLAIMER,
  YunoBallEnrichmentSchema,
  YunoBallSanitizedExportSchema,
  type YunoBallEnrichment,
  type YunoBallSanitizedExport,
  type YunoBallTeamExport,
} from "./yunoballSchemas";

export interface YunoBallAdapterOptions {
  /** Path to sanitized export JSON. */
  exportPath: string;
  cacheRoot: string;
  retrievedAt?: string;
  /** When false (default), missing file yields skipped enrichment instead of throwing. */
  required?: boolean;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function byTeamId(a: YunoBallTeamExport, b: YunoBallTeamExport): number {
  return a.teamId.localeCompare(b.teamId);
}

/**
 * Ensure market-context rows always carry the canonical disclaimer / role.
 * Rejects odds-like payloads that omit the market_context label.
 */
function normalizeMarketContext(team: YunoBallTeamExport): YunoBallTeamExport["marketContext"] {
  if (team.marketContext == null) return null;
  return {
    role: "market_context",
    disclaimer: MARKET_CONTEXT_DISCLAIMER,
    impliedWinProbability: team.marketContext.impliedWinProbability,
    impliedSpread: team.marketContext.impliedSpread,
    asOf: team.marketContext.asOf,
  };
}

function normalizeExport(raw: YunoBallSanitizedExport): YunoBallTeamExport[] {
  const teams = raw.teams.map((team) => {
    // Accept either canonical IDs or aliases in the sanitized file.
    let teamId = team.teamId;
    try {
      teamId = mapProviderTeamId(team.teamId, "yunoball-export");
    } catch (error) {
      if (error instanceof TeamIdMappingError) {
        throw new CoreStatAdapterError(error.message, "map");
      }
      throw error;
    }
    return {
      ...team,
      teamId,
      marketContext: normalizeMarketContext({ ...team, teamId }),
      dailyMetricFlags: [...team.dailyMetricFlags].sort((a, b) => a.localeCompare(b)),
    };
  });

  const ids = teams.map((t) => t.teamId);
  if (new Set(ids).size !== ids.length) {
    throw new CoreStatAdapterError("YunoBall export contains duplicate teamId", "normalize");
  }

  return teams.sort(byTeamId);
}

export function skippedYunoBallEnrichment(retrievedAt: string, reason: string): YunoBallEnrichment {
  return {
    meta: {
      status: "skipped",
      reason,
      sourceLabel: "yunoball-sanitized",
      exportVersion: null,
      retrievedAt,
      asOf: null,
      teamCount: 0,
    },
    teams: [],
  };
}

/**
 * Optional YunoBall sanitized-export adapter.
 * Reads a local JSON artifact only — no database credentials, no network.
 */
export class YunoBallExportAdapter {
  readonly sourceName = "yunoball-sanitized";
  readonly sourceKind = "yunoball" as const;

  constructor(private readonly options: YunoBallAdapterOptions) {}

  async ingest(): Promise<YunoBallEnrichment> {
    const retrievedAt = this.options.retrievedAt ?? new Date().toISOString();
    const exportPath = path.resolve(this.options.exportPath);

    if (!(await fileExists(exportPath))) {
      if (this.options.required) {
        throw new CoreStatAdapterError(
          `YunoBall sanitized export required but missing at ${exportPath}`,
          "retrieve",
        );
      }
      return skippedYunoBallEnrichment(retrievedAt, "artifact_absent");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(await readFile(exportPath, "utf8")) as unknown;
    } catch (error) {
      throw new CoreStatAdapterError(
        `Invalid YunoBall export JSON at ${exportPath}: ${String(error)}`,
        "retrieve",
      );
    }

    const parsed = YunoBallSanitizedExportSchema.safeParse(parsedJson);
    if (!parsed.success) {
      throw new CoreStatAdapterError(
        `YunoBall export failed schema: ${JSON.stringify(parsed.error.issues)}`,
        "retrieve",
      );
    }

    try {
      await writeRawCache(this.options.cacheRoot, this.sourceName, retrievedAt, parsed.data);
    } catch (error) {
      throw new CoreStatAdapterError(`Failed to cache YunoBall export: ${String(error)}`, "cache");
    }

    const teams = normalizeExport(parsed.data);
    const enrichment: YunoBallEnrichment = {
      meta: {
        status: "applied",
        reason: null,
        sourceLabel: parsed.data.sourceLabel,
        exportVersion: parsed.data.exportVersion,
        retrievedAt,
        asOf: parsed.data.asOf,
        teamCount: teams.length,
      },
      teams,
    };

    const validated = YunoBallEnrichmentSchema.safeParse(enrichment);
    if (!validated.success) {
      throw new CoreStatAdapterError(
        `YunoBall enrichment invalid: ${JSON.stringify(validated.error.issues)}`,
        "validate",
      );
    }
    return validated.data;
  }
}
