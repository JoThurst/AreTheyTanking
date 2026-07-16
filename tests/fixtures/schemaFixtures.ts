import type {
  DraftClassAssessment,
  EditorialOverride,
  EvidenceItem,
  LeagueSnapshot,
  Source,
  TeamSummary,
} from "../../src/schemas";

const retrievedAt = "2026-07-16T14:00:00.000Z";

export const sampleSource: Source = {
  name: "NBA Official",
  url: "https://official.nba.com/example",
  retrievedAt,
  publishedAt: "2026-07-01T12:00:00.000Z",
};

export const sampleTeam: TeamSummary = {
  teamId: "UTA",
  season: "2026-27",
  mode: "offseason",
  competitiveState: "Rebuilding",
  tankScore: 72,
  scoreBand: "Tank Watch",
  confidence: "low",
  teamStrength: 28,
  draftIncentive: 81,
  competitiveIntent: "unknown",
  record: { wins: 0, losses: 0 },
  recentForm: null,
  scoreDelta7d: "unknown",
  summary:
    "High draft incentive and a development-focused roster; live deployment evidence is unavailable in the offseason.",
  components: [
    {
      key: "draft_incentive",
      value: 81,
      label: "Draft incentive",
      explanation: "Likely own-pick control in a weaker early 2027 class environment.",
    },
    {
      key: "competitive_intent",
      value: "unknown",
      label: "Competitive intent",
      explanation: "Offseason mode: deployment signals are not current.",
    },
  ],
  pickContext: {
    summary: "Expected to control 2027 first-round pick; protections unverified in seed data.",
    ownsPick: true,
    protections: null,
    verificationDate: "2026-07-16",
    sources: [sampleSource],
  },
  evidenceIds: [],
  updatedAt: retrievedAt,
  sourceRetrievedAt: retrievedAt,
  methodologyVersion: "0.1.0",
  stale: false,
  identity: {
    teamId: "UTA",
    name: "Utah Jazz",
    abbreviation: "UTA",
    slug: "utah-jazz",
    conference: "West",
    division: "Northwest",
    city: "Utah",
  },
};

export const evidenceTierA: EvidenceItem = {
  id: "ev-a-1",
  teamIds: ["UTA"],
  title: "Official injury report listing",
  claimSummary: "Primary players listed on official injury report.",
  tier: "A",
  status: "accepted_context",
  eventDate: "2026-02-10",
  discoveredAt: retrievedAt,
  source: sampleSource,
  scoreComponent: null,
  effectiveAt: retrievedAt,
  expiresAt: null,
  corroboratingIds: [],
  reviewerNote: "Context only; injury alone is not tanking evidence.",
};

export const evidenceTierB: EvidenceItem = {
  id: "ev-b-1",
  teamIds: ["IND"],
  title: "Beat report on rotation priority",
  claimSummary: "Named beat reporter quotes coach on development priority.",
  tier: "B",
  status: "accepted_scoring",
  eventDate: "2026-02-12",
  discoveredAt: retrievedAt,
  source: {
    ...sampleSource,
    name: "Established beat reporter",
    url: "https://example.com/beat-report",
  },
  scoreComponent: "roster_deprioritization",
  effectiveAt: retrievedAt,
  expiresAt: null,
  corroboratingIds: [],
  reviewerNote: "Accepted after review.",
};

export const evidenceTierC: EvidenceItem = {
  id: "ev-c-1",
  teamIds: ["UTA"],
  title: "Lineup-strength decline metric",
  claimSummary: "Derived lineup strength fell versus healthy baseline.",
  tier: "C",
  status: "accepted_scoring",
  eventDate: "2026-02-11",
  discoveredAt: retrievedAt,
  source: {
    ...sampleSource,
    name: "Internal derived metric",
    url: undefined,
  },
  scoreComponent: "deployment_anomaly",
  effectiveAt: retrievedAt,
  expiresAt: null,
  corroboratingIds: ["ev-a-1"],
  reviewerNote: null,
};

export const evidenceTierD: EvidenceItem = {
  id: "ev-d-1",
  teamIds: ["UTA"],
  title: "Reddit tanking thread",
  claimSummary: "Fan discussion alleging intentional losing.",
  tier: "D",
  status: "discovered",
  eventDate: "2026-02-11",
  discoveredAt: retrievedAt,
  source: {
    name: "Reddit",
    url: "https://www.reddit.com/r/nba/example",
    retrievedAt,
  },
  scoreComponent: null,
  effectiveAt: null,
  expiresAt: null,
  corroboratingIds: [],
  reviewerNote: "Discovery only; cannot affect score.",
};

export const sampleOverride: EditorialOverride = {
  id: "ov-1",
  teamId: "UTA",
  field: "tank_score",
  originalValue: 68,
  publishedValue: 72,
  reason: "Manual offseason calibration pending automated draft-incentive engine.",
  supportingEvidenceIds: [],
  author: "editor",
  createdAt: retrievedAt,
  reviewBy: "2026-08-01T00:00:00.000Z",
};

export const sampleDraftAssessment: DraftClassAssessment = {
  draftYear: 2027,
  indexScore: 48,
  confidence: "low",
  topProspectTierCount: 1,
  lotteryQualityTierCount: null,
  summary:
    "Early 2027 outlook is cooler than 2026; Tyran Stokes is the clearest top prospect while depth remains uncertain.",
  lotteryRuleMode: "3-2-1 Lottery (2027–2029)",
  sources: [sampleSource],
  reviewedAt: retrievedAt,
  changeSincePrior: "Initial planning baseline.",
};

/** Minimal valid 30-team snapshot for schema tests (placeholder identities). */
export function buildMinimalSnapshot(): LeagueSnapshot {
  const teams: TeamSummary[] = [
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
  ].map((teamId, index) => ({
    ...sampleTeam,
    teamId: teamId as TeamSummary["teamId"],
    tankScore: index,
    scoreBand: "Full Competition",
    identity: {
      teamId: teamId as TeamSummary["teamId"],
      name: `Team ${teamId}`,
      abbreviation: teamId as TeamSummary["teamId"],
      slug: `team-${teamId.toLowerCase()}`,
      conference: index < 15 ? "East" : "West",
      division: index < 15 ? "Atlantic" : "Pacific",
      city: teamId,
    },
  }));

  return {
    meta: {
      season: "2026-27",
      mode: "offseason",
      generatedAt: retrievedAt,
      methodologyVersion: "0.1.0",
      stale: false,
      lastSuccessfulUpdateAt: retrievedAt,
      draftAssessment: sampleDraftAssessment,
    },
    teams,
    evidence: [evidenceTierA, evidenceTierB, evidenceTierC, evidenceTierD],
    overrides: [sampleOverride],
  };
}
