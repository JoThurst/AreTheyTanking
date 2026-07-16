# Scoring and Evidence Specification

Version: 0.1  
Status: Proposed baseline; calibrate during Sprint 3

## 1. Model purpose

Tank Score is an explainable indicator of incentives and conduct consistent with deprioritizing current wins. It is not a finding of intent, a medical judgment, or an NBA disciplinary determination.

Team strength is deliberately displayed outside the Tank Score. A weak team using its strongest available rotation should be allowed to score low.

## 2. Score architecture

### Published measures

- `team_strength`: 0 means weakest; 100 means strongest.
- `draft_incentive`: 0 means losing provides little practical draft benefit; 100 means the incentive is unusually strong.
- `competitive_intent`: 0 means strong evidence of deprioritizing current wins; 100 means strong evidence of trying to win with available resources.
- `tank_score`: 0 means no meaningful current tank signal; 100 means multiple strong, recent signals.
- `confidence`: low, medium, or high based on coverage and evidence quality.

### Tank Score v1

First calculate an intent-risk score:

```text
intent_risk =
    0.55 * deployment_anomaly
  + 0.25 * roster_deprioritization
  + 0.20 * performance_divergence
```

Then calculate:

```text
tank_score = round(
    0.70 * intent_risk
  + 0.25 * draft_incentive
  + 0.05 * official_action_signal
)
```

All inputs are 0-100. `official_action_signal` is time-bounded; it is not a permanent franchise penalty.

This formula is provisional. Sprint 3 may change weights only after backtesting and recording the rationale.

## 3. Component definitions

### Deployment anomaly

Measures deviation from the strongest reasonably available rotation.

Candidate inputs:

- Top healthy players inactive or unused.
- Abrupt unexplained minutes reductions.
- Competitive fourth-quarter benching of playable high-impact players.
- Lineup-strength decline relative to the team's healthy baseline.
- Multiple starters resting in the same game when alternatives would reduce competitive impact.

Guardrails:

- Official injury designation alone does not add risk.
- Back-to-backs, return-to-play plans, age, and schedule density must be considered.
- Garbage-time minutes are excluded.
- A single unusual game normally produces low confidence.

### Roster deprioritization

Measures longer-term choices that reduce current competitiveness.

Candidate inputs:

- Trading productive veterans primarily for future assets.
- Waiving or shelving capable veterans while emphasizing development.
- Leaving evident roster weaknesses unaddressed after playoff elimination.
- Publicly announced development priorities.

These actions can be legitimate rebuilding. They raise context, not certainty.

### Performance divergence

Measures recent results versus a relevant expectation, not raw losing.

Candidate inputs:

- Recent net rating versus season baseline.
- Closing-spread residuals from YunoBall odds data.
- Clutch deployment/result anomalies.
- Healthy-lineup performance versus reduced-lineup performance.

This component is capped at 20% of intent risk because performance is noisy and can reflect normal variance.

### Draft incentive

Candidate calculation:

```text
draft_incentive =
    0.35 * pick_control_value
  + 0.25 * lottery_position_value
  + 0.20 * draft_class_strength
  + 0.10 * elimination_status
  + 0.10 * protection_or_swap_pressure
```

Rules:

- A team that does not control the benefit of its own losses receives a lower score.
- Pick protections and swaps are modeled explicitly.
- Apply the active lottery system for the relevant draft year.
- Beginning with the 2027 Draft, the bottom-three draft-relegation penalty must be represented.
- Draft-class strength changes slowly and cannot move a team's Tank Score by more than 10 points in one review cycle.

### Official action signal

- 100: recent official league discipline explicitly tied to roster management or competitive integrity.
- 60: active official investigation confirmed by the league.
- 25: relevant recent Player Participation Policy violation without clear tanking context.
- 0: no relevant recent action.

Default decay is 10 points per 14 days after the event unless new related conduct occurs. Historical action remains visible in the evidence timeline after its scoring effect expires.

## 4. Draft Class Strength Index

Draft quality is a league-level context measure, not a team behavior measure.

Score dimensions:

- 35% projected franchise-player quality at the top.
- 25% top-five depth.
- 20% lottery depth.
- 10% first-round depth.
- 10% evaluator consensus.

Required publication fields:

- Draft year.
- Index score and confidence.
- Top-prospect tier count.
- Lottery-quality tier count.
- Short consensus summary.
- Source list and review date.
- Change since prior review.

Current planning baseline:

- 2026 was considered an unusually strong class.
- Early 2027 consensus appears weaker and less certain beyond Tyran Stokes.
- Confidence in a July 2026 rating must be low because the college/international season has not supplied enough evidence.

The index must be reviewed monthly in the offseason, biweekly during the college season, and after major prospect events or eligibility changes.

## 5. Evidence tiers

| Tier | Source type | Can affect score? | Examples |
| --- | --- | --- | --- |
| A | Official primary evidence | Yes | NBA discipline, official injury reports, team transactions, game logs |
| B | High-quality direct reporting | Yes, after review | Established national reporter, named beat reporting, direct coach/player comments |
| C | Reproducible derived evidence | Yes | Rotation anomaly, lineup data, schedule-adjusted metrics, odds residuals |
| D | Social discovery | No | Reddit threads, fan video, unsourced posts, memes |

Tier D may create a research lead. It must be corroborated by Tier A-C evidence before affecting any score.

## 6. Evidence lifecycle

Each discovery moves through:

```text
discovered -> needs_review -> accepted_context | accepted_scoring | rejected | superseded
```

Required fields:

- Stable ID.
- Team(s).
- Event date and discovery date.
- Title and canonical URL.
- Publisher/source and author when available.
- Tier.
- Claim summary written by the reviewer.
- Status and reviewer note.
- Score component affected, if accepted for scoring.
- Effective and expiration dates.
- Corroborating evidence IDs.

## 7. Confidence

Confidence reflects whether sufficient recent evidence exists to support the published score.

- **Low:** sparse data, offseason projection, one ambiguous event, or mostly contextual evidence.
- **Medium:** current quantitative coverage plus at least one accepted Tier A-C item.
- **High:** multiple independent, recent Tier A-C items with no material unresolved contradiction.

A high numerical score with low confidence is valid and must be labeled clearly.

## 8. Recency and snapshots

- Deployment evidence: half-life target of 14 days.
- Roster-direction evidence: review after 30 days; may remain relevant for a season.
- Draft/pick evidence: valid until a transaction, lottery, protection outcome, or new draft assessment changes it.
- Official action: remains historical; scoring effect decays.
- Every published update produces an immutable dated snapshot.

## 9. Editorial overrides

An override must include:

- Original calculated value.
- Published value.
- Reason.
- Supporting evidence IDs.
- Author and timestamp.
- Review/expiration date.

An override cannot convert Tier D social chatter directly into scoring evidence.

## 10. Backtest requirements

Use the final six to eight weeks of 2025-26 where data permits.

Positive cases:

- Utah games cited in the February 2026 NBA fine.
- Indiana game cited in the February 2026 NBA fine.

Negative/control cases:

- Poor teams consistently playing their strongest available rotation.
- Contenders resting players with documented schedule or medical context.
- Teams with little or no control over their own pick.

Report:

- Score and component movement before and after each event.
- False positives and their cause.
- Missing data.
- Recommended weight/threshold changes.
- Whether a reasonable reader can understand each result.

