/**
 * Canonical list of 30 NBA franchise IDs.
 * This is the single source of truth for valid teamId values.
 * Abbreviations match common NBA.com / ESPN usage (CHA, not CHO; NOP, not NO).
 */
export const TEAM_IDS = [
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
] as const;

export type TeamId = (typeof TEAM_IDS)[number];

export const TEAM_ID_SET: ReadonlySet<string> = new Set(TEAM_IDS);

export function isTeamId(value: string): value is TeamId {
  return TEAM_ID_SET.has(value);
}
