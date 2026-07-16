import type { Confidence, CompetitiveState, TeamSummary } from "../schemas";

export type SortKey = "tankScore" | "change" | "record" | "form" | "confidence";

export interface LeagueFilters {
  sort: SortKey;
  conference: "all" | "East" | "West";
  state: "all" | CompetitiveState;
  confidence: "all" | Confidence;
}

export const DEFAULT_FILTERS: LeagueFilters = {
  sort: "tankScore",
  conference: "all",
  state: "all",
  confidence: "all",
};

const CONFIDENCE_RANK: Record<Confidence, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function scoreNum(value: TeamSummary["tankScore"]): number {
  return value === "unknown" ? -1 : value;
}

function deltaNum(value: TeamSummary["scoreDelta7d"]): number {
  return value === "unknown" ? Number.NEGATIVE_INFINITY : value;
}

function winPct(team: TeamSummary): number {
  const total = team.record.wins + team.record.losses;
  if (total === 0) return -1;
  return team.record.wins / total;
}

function formScore(team: TeamSummary): number {
  if (!team.recentForm || team.recentForm.last10Wins === null) return -1;
  return team.recentForm.last10Wins;
}

function compareBySort(a: TeamSummary, b: TeamSummary, sort: SortKey): number {
  switch (sort) {
    case "tankScore": {
      const diff = scoreNum(b.tankScore) - scoreNum(a.tankScore);
      return diff !== 0 ? diff : a.identity.name.localeCompare(b.identity.name);
    }
    case "change": {
      const diff = deltaNum(b.scoreDelta7d) - deltaNum(a.scoreDelta7d);
      return diff !== 0 ? diff : a.identity.name.localeCompare(b.identity.name);
    }
    case "record": {
      const diff = winPct(b) - winPct(a);
      if (diff !== 0) return diff;
      const winDiff = b.record.wins - a.record.wins;
      return winDiff !== 0 ? winDiff : a.identity.name.localeCompare(b.identity.name);
    }
    case "form": {
      const diff = formScore(b) - formScore(a);
      return diff !== 0 ? diff : a.identity.name.localeCompare(b.identity.name);
    }
    case "confidence": {
      const diff = CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence];
      return diff !== 0 ? diff : a.identity.name.localeCompare(b.identity.name);
    }
    default:
      return a.identity.name.localeCompare(b.identity.name);
  }
}

export function filterTeams(teams: TeamSummary[], filters: LeagueFilters): TeamSummary[] {
  return teams.filter((team) => {
    if (filters.conference !== "all" && team.identity.conference !== filters.conference) {
      return false;
    }
    if (filters.state !== "all" && team.competitiveState !== filters.state) {
      return false;
    }
    if (filters.confidence !== "all" && team.confidence !== filters.confidence) {
      return false;
    }
    return true;
  });
}

export function sortTeams(teams: TeamSummary[], sort: SortKey): TeamSummary[] {
  return [...teams].sort((a, b) => compareBySort(a, b, sort));
}

export function applyLeagueFilters(teams: TeamSummary[], filters: LeagueFilters): TeamSummary[] {
  return sortTeams(filterTeams(teams, filters), filters.sort);
}

export function parseFiltersFromSearch(search: string): LeagueFilters {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const sort = params.get("sort");
  const conference = params.get("conference");
  const state = params.get("state");
  const confidence = params.get("confidence");

  return {
    sort: isSortKey(sort) ? sort : DEFAULT_FILTERS.sort,
    conference: isConference(conference) ? conference : DEFAULT_FILTERS.conference,
    state: isState(state) ? state : DEFAULT_FILTERS.state,
    confidence: isConfidence(confidence) ? confidence : DEFAULT_FILTERS.confidence,
  };
}

export function filtersToSearch(filters: LeagueFilters): string {
  const params = new URLSearchParams();
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.conference !== DEFAULT_FILTERS.conference) {
    params.set("conference", filters.conference);
  }
  if (filters.state !== DEFAULT_FILTERS.state) params.set("state", filters.state);
  if (filters.confidence !== DEFAULT_FILTERS.confidence) {
    params.set("confidence", filters.confidence);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function isSortKey(value: string | null): value is SortKey {
  return (
    value === "tankScore" ||
    value === "change" ||
    value === "record" ||
    value === "form" ||
    value === "confidence"
  );
}

function isConference(value: string | null): value is LeagueFilters["conference"] {
  return value === "all" || value === "East" || value === "West";
}

function isState(value: string | null): value is LeagueFilters["state"] {
  return (
    value === "all" ||
    value === "Contender" ||
    value === "Playoff Push" ||
    value === "Play-In Fight" ||
    value === "Crossroads" ||
    value === "Development Season" ||
    value === "Rebuilding" ||
    value === "Tank Watch" ||
    value === "Confirmed League Action"
  );
}

function isConfidence(value: string | null): value is LeagueFilters["confidence"] {
  return value === "all" || value === "low" || value === "medium" || value === "high";
}
