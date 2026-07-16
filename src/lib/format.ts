import type { ScoreValue, TeamSummary } from "../schemas";

export function formatScore(value: ScoreValue): string {
  return value === "unknown" ? "unknown" : String(value);
}

export function formatRecord(team: TeamSummary): string {
  return `${team.record.wins}–${team.record.losses}`;
}

export function formatDelta(delta: TeamSummary["scoreDelta7d"]): string {
  if (delta === "unknown") return "Δ unknown";
  if (delta > 0) return `Δ +${delta}`;
  if (delta < 0) return `Δ ${delta}`;
  return "Δ 0";
}

export function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function teamHref(team: TeamSummary): string {
  return `/team/${team.identity.slug}/`;
}
