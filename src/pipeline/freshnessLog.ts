import type { NormalizedCoreStats } from "./schemas";
import type { GenerationManifest } from "./generationManifest";
import type { PipelineStatus } from "./pipelineStatus";
import type { LeagueSnapshot } from "../schemas";

/**
 * Structured freshness / team-count log lines for pipeline operators.
 * Safe for CI logs — does not include secrets or absolute machine paths.
 */
export function formatCoreStatsFreshnessLog(stats: NormalizedCoreStats): string {
  return [
    `freshness source=${stats.meta.sourceName}`,
    `teams=${stats.meta.teamCount}`,
    `asOf=${stats.meta.asOf}`,
    `retrievedAt=${stats.meta.retrievedAt}`,
    `season=${stats.meta.season}`,
  ].join(" ");
}

export function formatSnapshotFreshnessLog(snapshot: LeagueSnapshot): string {
  return [
    `freshness public-teams=${snapshot.teams.length}`,
    `lastSuccessfulUpdateAt=${snapshot.meta.lastSuccessfulUpdateAt}`,
    `generatedAt=${snapshot.meta.generatedAt}`,
    `stale=${snapshot.meta.stale}`,
    `methodology=${snapshot.meta.methodologyVersion}`,
  ].join(" ");
}

export function formatManifestFreshnessLog(manifest: GenerationManifest): string {
  return [
    `freshness manifest-teams=${manifest.teamCount}`,
    `corePresent=${manifest.inputs.coreStats.present}`,
    `coreAsOf=${manifest.inputs.coreStats.asOf ?? "n/a"}`,
    `yunoball=${manifest.inputs.yunoballEnrichment.status}`,
    `methodology=${manifest.methodologyVersion}`,
  ].join(" ");
}

export function formatPipelineStatusLog(status: PipelineStatus): string {
  const failure =
    status.failure == null
      ? "failure=none"
      : `failure=${status.failure.source}/${status.failure.step}`;
  return [
    `freshness pipeline-status=${status.status}`,
    `stale=${status.stale}`,
    `lastSuccessfulUpdateAt=${status.lastSuccessfulUpdateAt}`,
    `lastAttemptAt=${status.lastAttemptAt}`,
    failure,
  ].join(" ");
}
