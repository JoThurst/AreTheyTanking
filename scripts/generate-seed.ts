import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TEAM_IDS } from "../src/data/teamIds";
import { SEED_TEAMS, assertSeedCoverage, scoreBandFor } from "../src/data/seedTeams";
import { LeagueSnapshotSchema, type LeagueSnapshot, type TeamSummary } from "../src/schemas";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "data", "league-snapshot.json");
const editorialPath = path.join(root, "data", "editorial-snapshot.json");

const NOW = "2026-07-16T14:00:00.000Z";
const METHODOLOGY_VERSION = "0.1.0";
const SEASON = "2026-27";

function buildTeam(seed: (typeof SEED_TEAMS)[number]): TeamSummary {
  return {
    teamId: seed.identity.teamId,
    season: SEASON,
    mode: "offseason",
    competitiveState: seed.competitiveState,
    tankScore: seed.tankScore,
    scoreBand: scoreBandFor(seed.tankScore),
    confidence: seed.confidence,
    teamStrength: seed.teamStrength,
    draftIncentive: seed.draftIncentive,
    competitiveIntent: seed.competitiveIntent,
    record: { wins: 0, losses: 0 },
    recentForm: null,
    scoreDelta7d: "unknown",
    summary: seed.summary,
    components: [
      {
        key: "team_strength",
        value: seed.teamStrength,
        label: "Team strength",
        explanation:
          seed.teamStrength === "unknown"
            ? "Team strength is unknown in this seed."
            : "Curated offseason roster-strength estimate; not a tanking accusation.",
      },
      {
        key: "draft_incentive",
        value: seed.draftIncentive,
        label: "Draft incentive",
        explanation:
          seed.draftIncentive === "unknown"
            ? "Draft incentive is unknown until pick control is verified."
            : "Curated planning estimate from pick outlook and early 2027 class context.",
      },
      {
        key: "competitive_intent",
        value: seed.competitiveIntent,
        label: "Competitive intent",
        explanation:
          "Offseason mode: live deployment signals are unavailable, so intent is marked unknown rather than zero.",
      },
    ],
    pickContext: {
      summary: seed.pickSummary,
      ownsPick: seed.ownsPick,
      protections: null,
      verificationDate: "2026-07-16",
      sources: [],
    },
    evidenceIds: [],
    updatedAt: NOW,
    sourceRetrievedAt: null,
    methodologyVersion: METHODOLOGY_VERSION,
    stale: false,
    identity: seed.identity,
  };
}

function buildSnapshot(): LeagueSnapshot {
  assertSeedCoverage(TEAM_IDS);
  return {
    meta: {
      season: SEASON,
      mode: "offseason",
      generatedAt: NOW,
      methodologyVersion: METHODOLOGY_VERSION,
      stale: false,
      lastSuccessfulUpdateAt: NOW,
      draftAssessment: {
        draftYear: 2027,
        indexScore: 48,
        confidence: "low",
        topProspectTierCount: 1,
        lotteryQualityTierCount: null,
        summary:
          "Early 2027 outlook is cooler than 2026; Tyran Stokes is the clearest top prospect while depth remains uncertain. Confidence is low in July 2026.",
        lotteryRuleMode: "3-2-1 Lottery (2027–2029 drafts)",
        sources: [
          {
            name: "NBA Board of Governors lottery approval",
            url: "https://www.nba.com/news/nba-board-governors-approve-new-draft-lottery-system",
            retrievedAt: NOW,
          },
        ],
        reviewedAt: NOW,
        changeSincePrior: "Initial planning baseline for static MVP.",
      },
    },
    teams: SEED_TEAMS.map(buildTeam),
    evidence: [],
    overrides: [],
  };
}

async function main(): Promise<void> {
  const snapshot = buildSnapshot();
  const parsed = LeagueSnapshotSchema.safeParse(snapshot);
  if (!parsed.success) {
    console.error(JSON.stringify(parsed.error.issues, null, 2));
    process.exit(1);
  }

  const body = `${JSON.stringify(parsed.data, null, 2)}\n`;
  await writeFile(editorialPath, body, "utf8");
  await writeFile(outPath, body, "utf8");
  console.log(`Wrote ${editorialPath} and ${outPath} (${parsed.data.teams.length} teams)`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
