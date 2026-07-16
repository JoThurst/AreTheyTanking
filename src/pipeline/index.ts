/**
 * Core-stat ingestion pipeline.
 *
 * Adapters produce NormalizedCoreStats. UI and public snapshot modules must not
 * import provider-shaped types (e.g. ProviderCoreStatsPayload).
 */
export type { CoreStatSourceAdapter } from "./adapter";
export { CoreStatAdapterError } from "./adapter";
export { writeRawCache, readRawCache, buildRawCachePath } from "./cache";
export {
  FixtureCoreStatAdapter,
  ProviderCoreStatsPayloadSchema,
  type FixtureAdapterOptions,
  type ProviderCoreStatsPayload,
} from "./fixtureAdapter";
export {
  NormalizedCoreStatsSchema,
  NormalizedCoreTeamSchema,
  type NormalizedCoreStats,
  type NormalizedCoreTeam,
} from "./schemas";
export { mapProviderTeamId, mapProviderTeamIds, TeamIdMappingError } from "./teamIdMap";
export { YunoBallExportAdapter, skippedYunoBallEnrichment } from "./yunoballAdapter";
export {
  MARKET_CONTEXT_DISCLAIMER,
  YunoBallEnrichmentSchema,
  YunoBallSanitizedExportSchema,
  type YunoBallEnrichment,
  type YunoBallSanitizedExport,
} from "./yunoballSchemas";
export {
  generatePublicSnapshot,
  stableStringify,
  PublicSnapshotGenerationError,
} from "./generatePublicSnapshot";
export {
  GenerationManifestSchema,
  PROTECTED_EDITORIAL_FIELDS,
  AUTOMATED_TEAM_FIELDS,
  type GenerationManifest,
} from "./generationManifest";
export { publishLastKnownGood, recordPublishFailure, readPipelineStatus } from "./publish";
export {
  PipelineStatusSchema,
  sanitizeFailureMessage,
  type PipelineStatus,
  type PipelineFailure,
} from "./pipelineStatus";
export {
  formatCoreStatsFreshnessLog,
  formatSnapshotFreshnessLog,
  formatManifestFreshnessLog,
  formatPipelineStatusLog,
} from "./freshnessLog";
