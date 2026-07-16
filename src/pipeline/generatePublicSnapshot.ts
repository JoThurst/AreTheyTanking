import { createHash } from "node:crypto";
import type { LeagueSnapshot, TeamSummary } from "../schemas";
import { LeagueSnapshotSchema } from "../schemas";
import type { NormalizedCoreStats } from "./schemas";
import type { YunoBallEnrichment } from "./yunoballSchemas";
import {
  AUTOMATED_TEAM_FIELDS,
  GenerationManifestSchema,
  PROTECTED_EDITORIAL_FIELDS,
  type GenerationManifest,
} from "./generationManifest";

export class PublicSnapshotGenerationError extends Error {
  constructor(
    message: string,
    readonly step: "load" | "merge" | "validate" | "serialize",
  ) {
    super(message);
    this.name = "PublicSnapshotGenerationError";
  }
}

export interface GeneratePublicSnapshotInput {
  editorial: LeagueSnapshot;
  coreStats: NormalizedCoreStats | null;
  yunoball: YunoBallEnrichment | null;
  generatedAt: string;
  paths: {
    editorialSnapshot: string;
    coreStats: string;
    yunoballEnrichment: string;
  };
  hashes?: {
    editorialSnapshot?: string | null;
    coreStats?: string | null;
    yunoballEnrichment?: string | null;
  };
}

export interface GeneratePublicSnapshotResult {
  snapshot: LeagueSnapshot;
  manifest: GenerationManifest;
  serializedSnapshot: string;
  serializedManifest: string;
}

function sha256Json(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

/** Deterministic JSON: sorted object keys; arrays keep caller order. */
export function stableStringify(value: unknown): string {
  return `${JSON.stringify(sortKeysDeep(value), null, 2)}\n`;
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort((a, b) => a.localeCompare(b))) {
      sorted[key] = sortKeysDeep(record[key]);
    }
    return sorted;
  }
  return value;
}

function assertEditorialUntouched(before: TeamSummary, after: TeamSummary): void {
  for (const field of PROTECTED_EDITORIAL_FIELDS) {
    if (stableStringify(before[field]) !== stableStringify(after[field])) {
      throw new PublicSnapshotGenerationError(
        `Protected editorial field "${field}" changed for team ${before.teamId}`,
        "merge",
      );
    }
  }
}

function mergeTeam(editorial: TeamSummary, coreStats: NormalizedCoreStats | null): TeamSummary {
  const core = coreStats?.teams.find((t) => t.teamId === editorial.teamId);
  if (!core) {
    return { ...editorial };
  }

  const merged: TeamSummary = {
    ...editorial,
    record: core.record ?? editorial.record,
    recentForm: core.recentForm ?? editorial.recentForm,
    sourceRetrievedAt: core.sourceRetrievedAt,
  };

  assertEditorialUntouched(editorial, merged);
  return merged;
}

/**
 * Merge automated core facts into an editorial league snapshot.
 * Does not overwrite evidence, summaries, competitive states, scores, or overrides.
 * YunoBall enrichment is recorded in the manifest only; market/odds fields are never
 * written into Tank Score or competitive-intent fields on the public snapshot.
 */
export function generatePublicSnapshot(
  input: GeneratePublicSnapshotInput,
): GeneratePublicSnapshotResult {
  const editorialTeams = [...input.editorial.teams].sort((a, b) =>
    a.teamId.localeCompare(b.teamId),
  );
  const evidence = [...input.editorial.evidence].sort((a, b) => a.id.localeCompare(b.id));
  const overrides = [...input.editorial.overrides].sort((a, b) => a.id.localeCompare(b.id));

  if (editorialTeams.length !== 30) {
    throw new PublicSnapshotGenerationError(
      `Expected 30 editorial teams, got ${editorialTeams.length}`,
      "merge",
    );
  }

  const mergedTeams = editorialTeams.map((team) => mergeTeam(team, input.coreStats));

  const snapshotCandidate: LeagueSnapshot = {
    meta: {
      ...input.editorial.meta,
      generatedAt: input.generatedAt,
      lastSuccessfulUpdateAt: input.generatedAt,
    },
    teams: mergedTeams,
    evidence,
    overrides,
  };

  const validated = LeagueSnapshotSchema.safeParse(snapshotCandidate);
  if (!validated.success) {
    throw new PublicSnapshotGenerationError(
      `Generated snapshot invalid: ${JSON.stringify(validated.error.issues)}`,
      "validate",
    );
  }

  // Ensure snapshot-level editorial collections were not content-mutated (sort-only).
  const editorialEvidenceSorted = [...input.editorial.evidence].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const editorialOverridesSorted = [...input.editorial.overrides].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  if (stableStringify(evidence) !== stableStringify(editorialEvidenceSorted)) {
    throw new PublicSnapshotGenerationError("Evidence was mutated during merge", "merge");
  }
  if (stableStringify(overrides) !== stableStringify(editorialOverridesSorted)) {
    throw new PublicSnapshotGenerationError("Overrides were mutated during merge", "merge");
  }

  const yStatus =
    input.yunoball == null
      ? "absent"
      : input.yunoball.meta.status === "applied"
        ? "applied"
        : "skipped";

  const manifestCandidate: GenerationManifest = {
    generatedAt: input.generatedAt,
    methodologyVersion: validated.data.meta.methodologyVersion,
    teamCount: 30,
    inputs: {
      editorialSnapshot: {
        path: input.paths.editorialSnapshot,
        sha256: input.hashes?.editorialSnapshot ?? sha256Json(input.editorial),
        present: true,
      },
      coreStats: {
        path: input.paths.coreStats,
        sha256: input.hashes?.coreStats ?? (input.coreStats ? sha256Json(input.coreStats) : null),
        present: input.coreStats != null,
        sourceName: input.coreStats?.meta.sourceName ?? null,
        asOf: input.coreStats?.meta.asOf ?? null,
        season: input.coreStats?.meta.season ?? null,
      },
      yunoballEnrichment: {
        path: input.paths.yunoballEnrichment,
        sha256:
          input.hashes?.yunoballEnrichment ?? (input.yunoball ? sha256Json(input.yunoball) : null),
        present: input.yunoball != null,
        status: yStatus,
        exportVersion: input.yunoball?.meta.exportVersion ?? null,
      },
    },
    protectedEditorialFields: [...PROTECTED_EDITORIAL_FIELDS],
    automatedFieldsApplied: [...AUTOMATED_TEAM_FIELDS],
  };

  const manifestParsed = GenerationManifestSchema.safeParse(manifestCandidate);
  if (!manifestParsed.success) {
    throw new PublicSnapshotGenerationError(
      `Generation manifest invalid: ${JSON.stringify(manifestParsed.error.issues)}`,
      "validate",
    );
  }

  return {
    snapshot: validated.data,
    manifest: manifestParsed.data,
    serializedSnapshot: stableStringify(validated.data),
    serializedManifest: stableStringify(manifestParsed.data),
  };
}
