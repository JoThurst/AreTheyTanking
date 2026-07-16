import type { TeamId } from "../data/teamIds";
import { isTeamId } from "../data/teamIds";

/**
 * Maps provider-specific franchise identifiers to canonical TEAM_IDS.
 * Unknown or ambiguous mappings throw — never silently drop or guess.
 */

export class TeamIdMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamIdMappingError";
  }
}

/** Common alternate abbreviations / NBA.com-style ids seen in provider payloads. */
const ALIAS_TO_CANONICAL: ReadonlyMap<string, TeamId> = new Map([
  // Already-canonical abbreviations
  ...(
    [
      "ATL",
      "BOS",
      "BKN",
      "CHA",
      "CHI",
      "CLE",
      "DAL",
      "DEN",
      "DET",
      "GSW",
      "HOU",
      "IND",
      "LAC",
      "LAL",
      "MEM",
      "MIA",
      "MIL",
      "MIN",
      "NOP",
      "NYK",
      "OKC",
      "ORL",
      "PHI",
      "PHX",
      "POR",
      "SAC",
      "SAS",
      "TOR",
      "UTA",
      "WAS",
    ] as TeamId[]
  ).map((id) => [id, id] as const),
  // Alternate abbreviations
  ["BRK", "BKN"],
  ["CHO", "CHA"],
  ["CHH", "CHA"],
  ["NO", "NOP"],
  ["NOH", "NOP"],
  ["NOL", "NOP"],
  ["PHO", "PHX"],
  ["SAN", "SAS"],
  ["SA", "SAS"],
  ["GS", "GSW"],
  ["GOLDEN_STATE", "GSW"],
  ["NY", "NYK"],
  ["WSH", "WAS"],
  ["UTH", "UTA"],
  // NBA stats API numeric franchise ids
  ["1610612737", "ATL"],
  ["1610612738", "BOS"],
  ["1610612751", "BKN"],
  ["1610612766", "CHA"],
  ["1610612741", "CHI"],
  ["1610612739", "CLE"],
  ["1610612742", "DAL"],
  ["1610612743", "DEN"],
  ["1610612765", "DET"],
  ["1610612744", "GSW"],
  ["1610612745", "HOU"],
  ["1610612754", "IND"],
  ["1610612746", "LAC"],
  ["1610612747", "LAL"],
  ["1610612763", "MEM"],
  ["1610612748", "MIA"],
  ["1610612749", "MIL"],
  ["1610612750", "MIN"],
  ["1610612740", "NOP"],
  ["1610612752", "NYK"],
  ["1610612760", "OKC"],
  ["1610612753", "ORL"],
  ["1610612755", "PHI"],
  ["1610612756", "PHX"],
  ["1610612757", "POR"],
  ["1610612758", "SAC"],
  ["1610612759", "SAS"],
  ["1610612761", "TOR"],
  ["1610612762", "UTA"],
  ["1610612764", "WAS"],
]);

export function normalizeProviderTeamKey(raw: string | number): string {
  return String(raw).trim().toUpperCase().replace(/\s+/g, "_");
}

/**
 * Resolve a provider team key to a canonical TeamId.
 * @throws TeamIdMappingError when the key is unknown or empty.
 */
export function mapProviderTeamId(raw: string | number, sourceLabel = "provider"): TeamId {
  const key = normalizeProviderTeamKey(raw);
  if (!key) {
    throw new TeamIdMappingError(`${sourceLabel}: empty team identifier`);
  }
  const mapped = ALIAS_TO_CANONICAL.get(key);
  if (mapped) return mapped;
  if (isTeamId(key)) return key;
  throw new TeamIdMappingError(
    `${sourceLabel}: unknown team identifier "${raw}" (normalized "${key}")`,
  );
}

export function mapProviderTeamIds(
  rawIds: Array<string | number>,
  sourceLabel = "provider",
): TeamId[] {
  return rawIds.map((id) => mapProviderTeamId(id, sourceLabel));
}
