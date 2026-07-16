import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { LeagueSnapshotSchema, type LeagueSnapshot, type TeamSummary } from "../schemas";
import { PipelineStatusSchema, type PipelineStatus } from "../pipeline/pipelineStatus";

/** Always resolve from process cwd (repo root during `astro build` / `npm run test`). */
const snapshotPath = path.join(process.cwd(), "data", "league-snapshot.json");
const pipelineStatusPath = path.join(process.cwd(), "data", "pipeline-status.json");

let cached: LeagueSnapshot | null = null;

function loadPipelineStatus(): PipelineStatus | null {
  if (!existsSync(pipelineStatusPath)) return null;
  try {
    const raw = JSON.parse(readFileSync(pipelineStatusPath, "utf8")) as unknown;
    const parsed = PipelineStatusSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Apply last-known-good / stale overlay from pipeline-status.json without mutating
 * the on-disk public snapshot teams payload.
 */
function applyPipelineOverlay(snapshot: LeagueSnapshot): LeagueSnapshot {
  const status = loadPipelineStatus();
  if (!status) return snapshot;

  return {
    ...snapshot,
    meta: {
      ...snapshot.meta,
      stale: status.stale || snapshot.meta.stale,
      lastSuccessfulUpdateAt: status.lastSuccessfulUpdateAt,
    },
  };
}

export function loadLeagueSnapshot(): LeagueSnapshot {
  if (cached) return cached;
  const raw = JSON.parse(readFileSync(snapshotPath, "utf8")) as unknown;
  const parsed = LeagueSnapshotSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid league snapshot: ${JSON.stringify(parsed.error.issues)}`);
  }
  cached = applyPipelineOverlay(parsed.data);
  return cached;
}

export function getPipelineStatus(): PipelineStatus | null {
  return loadPipelineStatus();
}

export function getAllTeams(): TeamSummary[] {
  return loadLeagueSnapshot().teams;
}

export function getTeamBySlug(slug: string): TeamSummary | undefined {
  return getAllTeams().find((team) => team.identity.slug === slug);
}

export function getTeamById(teamId: string): TeamSummary | undefined {
  return getAllTeams().find((team) => team.teamId === teamId);
}

/** Test helper: clear module cache between cases. */
export function __resetSnapshotCacheForTests(): void {
  cached = null;
}
