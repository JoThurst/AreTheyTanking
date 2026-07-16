import { readFileSync } from "node:fs";
import path from "node:path";
import { LeagueSnapshotSchema, type LeagueSnapshot, type TeamSummary } from "../schemas";

/** Always resolve from process cwd (repo root during `astro build` / `npm run test`). */
const snapshotPath = path.join(process.cwd(), "data", "league-snapshot.json");

let cached: LeagueSnapshot | null = null;

export function loadLeagueSnapshot(): LeagueSnapshot {
  if (cached) return cached;
  const raw = JSON.parse(readFileSync(snapshotPath, "utf8")) as unknown;
  const parsed = LeagueSnapshotSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid league snapshot: ${JSON.stringify(parsed.error.issues)}`);
  }
  cached = parsed.data;
  return cached;
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
