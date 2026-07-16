import type { NormalizedCoreStats } from "./schemas";

/**
 * Replaceable core-stat source adapter.
 * Implementations retrieve (or load) provider payloads and emit normalized stats.
 * UI components must consume only NormalizedCoreStats / LeagueSnapshot — never provider shapes.
 */
export interface CoreStatSourceAdapter {
  readonly sourceName: string;
  readonly sourceKind: NormalizedCoreStats["meta"]["sourceKind"];

  /**
   * Produce schema-valid normalized core stats.
   * Implementations should cache raw inputs when retrieval occurs.
   */
  ingest(): Promise<NormalizedCoreStats>;
}

export class CoreStatAdapterError extends Error {
  constructor(
    message: string,
    readonly step: "retrieve" | "cache" | "map" | "normalize" | "validate",
  ) {
    super(message);
    this.name = "CoreStatAdapterError";
  }
}
