/**
 * Publishable methodology content for the rendering layer (FR-201–FR-205).
 * Score weights remain provisional until Sprint 3 calibration.
 */

export const METHODOLOGY_VERSION = "0.1.0";

export const SCORE_BANDS = [
  { min: 0, max: 19, label: "Full Competition" },
  { min: 20, max: 39, label: "Competitive" },
  { min: 40, max: 59, label: "Direction Unclear" },
  { min: 60, max: 79, label: "Tank Watch" },
  { min: 80, max: 100, label: "Strong Tank Signal" },
] as const;

export const EVIDENCE_TIERS = [
  {
    tier: "A",
    name: "Official primary evidence",
    canAffectScore: true,
    examples: "NBA discipline, official injury reports, team transactions, game logs",
  },
  {
    tier: "B",
    name: "High-quality direct reporting",
    canAffectScore: true,
    examples: "Established national reporter, named beat reporting, direct coach/player comments",
  },
  {
    tier: "C",
    name: "Reproducible derived evidence",
    canAffectScore: true,
    examples: "Rotation anomaly, lineup data, schedule-adjusted metrics, odds residuals",
  },
  {
    tier: "D",
    name: "Social discovery",
    canAffectScore: false,
    examples: "Reddit threads, fan video, unsourced posts, memes",
  },
] as const;

export const CONFIDENCE_MEANINGS = [
  {
    level: "low",
    meaning:
      "Sparse data, offseason projection, one ambiguous event, or mostly contextual evidence.",
  },
  {
    level: "medium",
    meaning: "Current quantitative coverage plus at least one accepted Tier A–C item.",
  },
  {
    level: "high",
    meaning:
      "Multiple independent, recent Tier A–C items with no material unresolved contradiction.",
  },
] as const;

export const METHODOLOGY = {
  version: METHODOLOGY_VERSION,
  title: "Methodology & source policy",
  tagline: "Bad is not the same as tanking.",
  scoreName: "Tank Score",
  formulaVersionNote:
    "Tank Score v1 weights are provisional and will be calibrated in Sprint 3 after backtesting.",
  principles: [
    {
      title: "Bad is not tanking",
      body: "Team strength is shown separately from Tank Score. A weak team that deploys its strongest available rotation should be allowed to score low on tank signal.",
    },
    {
      title: "Explain every score",
      body: "A score without evidence and plain-language component explanations is incomplete.",
    },
    {
      title: "Social discussion is discovery, not proof",
      body: "Reddit and social chatter can create a research lead (Tier D) but cannot directly raise Tank Score. Tier D must be corroborated by Tier A–C evidence before affecting any score.",
    },
    {
      title: "Injuries receive a presumption of legitimacy",
      body: "Official injury designation alone does not add tanking risk. Availability anomalies require corroboration before scoring.",
    },
  ],
  components: [
    {
      key: "team_strength",
      label: "Team strength",
      description: "How competitive the current roster is. Displayed outside Tank Score.",
    },
    {
      key: "draft_incentive",
      label: "Draft incentive",
      description:
        "How much the franchise benefits from losing, given pick control, protections, lottery rules, and draft-class quality.",
    },
    {
      key: "competitive_intent",
      label: "Competitive intent",
      description:
        "Whether the team is deploying its strongest reasonably available roster and behaving as though current wins matter.",
    },
    {
      key: "tank_score",
      label: "Tank Score",
      description:
        "0–100 indicator of incentives and conduct consistent with deprioritizing current wins. Not a finding of intent or a disciplinary determination.",
    },
  ],
  formula: {
    intentRisk:
      "0.55 * deployment_anomaly + 0.25 * roster_deprioritization + 0.20 * performance_divergence",
    tankScore: "round(0.70 * intent_risk + 0.25 * draft_incentive + 0.05 * official_action_signal)",
  },
  scoreBands: SCORE_BANDS,
  evidenceTiers: EVIDENCE_TIERS,
  confidence: CONFIDENCE_MEANINGS,
  injuryGuardrails: [
    "Official injury designation alone does not add risk.",
    "Back-to-backs, return-to-play plans, age, and schedule density must be considered.",
    "Garbage-time minutes are excluded from deployment anomaly analysis.",
    "A single unusual game normally produces low confidence, not a high score.",
  ],
  falsePositiveGuardrails: [
    "Losing, youth, or injury alone is not tanking evidence.",
    "Record is never treated as proof of intent.",
    "Teams without control of their own pick receive lower draft incentive.",
    "Historical league action remains visible in timelines after its scoring effect decays.",
  ],
  socialSourceRules: [
    "Tier D sources may enter the research queue as discoveries only.",
    "Tier D cannot use status accepted_scoring and cannot change Tank Score directly.",
    "Social Heat, if shown later, remains a separate indicator outside Tank Score v1.",
  ],
  nonAffiliation:
    "Are They Tanking? is an independent fan project and is not affiliated with, endorsed by, or sponsored by the NBA or any NBA team.",
  corrections: {
    summary:
      "If you believe a score explanation, evidence item, or pick summary is wrong, send a correction with sources.",
    contactPlaceholder: "corrections@aretheytanking.example",
  },
  changelog: [
    {
      version: "0.1.0",
      date: "2026-07-16",
      notes:
        "Initial methodology content for static MVP. Formula weights provisional pending Sprint 3 backtest.",
    },
  ],
} as const;

export type MethodologyContent = typeof METHODOLOGY;
