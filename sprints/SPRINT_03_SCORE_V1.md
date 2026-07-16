# Sprint 3 — Tank Score v1 and Backtest

Duration: 1 week  
Goal: Produce a reproducible, explainable score with guardrails and historical calibration.  
Exit milestone: Defensible score private beta

## ATT-301 — Implement Draft Incentive v1

Priority: Urgent  
Estimate: 5  
Labels: `scoring`, `data-pipeline`

Depends on: ATT-203

### Objective

Measure how much a team benefits from losing without assuming every lottery team controls its pick.

### Scope

- Pick ownership, swaps, protections, lottery position, elimination status, applicable lottery rules, and draft-class context.
- Manual verified source file for complex pick conditions.
- 2027 3-2-1 Lottery mode.

### Acceptance criteria

- [ ] Teams that do not benefit from their own losses receive materially lower incentive.
- [ ] Pick protections/swaps include source and verification date.
- [ ] The correct lottery rules are selected by draft year.
- [ ] Bottom-three draft relegation is represented beginning in 2027.
- [ ] Unknown pick conditions lower confidence instead of defaulting to full ownership.
- [ ] Unit tests cover owned, unprotected owed, protected owed, and swap cases.

## ATT-302 — Implement competitive-deployment inputs

Priority: Urgent  
Estimate: 5  
Labels: `scoring`, `data-pipeline`, `trust-safety`

Depends on: ATT-203

### Objective

Detect unusual use of reasonably available players while respecting injury and schedule context.

### Scope

- Player participation/minutes baseline.
- Top-player or rotation-impact definition.
- Back-to-back, injury status, return-to-play, and garbage-time context.
- Deployment anomaly, roster deprioritization, and performance divergence inputs.

### Acceptance criteria

- [ ] A documented injury alone cannot increase deployment anomaly.
- [ ] Garbage-time changes are excluded or explicitly controlled.
- [ ] Abrupt minutes/participation changes create reviewable component evidence.
- [ ] Baseline and comparison windows are configurable and tested.
- [ ] Missing availability data reduces confidence rather than implying health.
- [ ] Generated explanations identify the underlying factual anomaly.

## ATT-303 — Implement Tank Score and confidence engine

Priority: Urgent  
Estimate: 5  
Labels: `scoring`, `testing`

Depends on: ATT-301, ATT-302

### Objective

Calculate versioned team measures and score without embedding product logic in UI code.

### Acceptance criteria

- [ ] Formula matches `02_SCORING_AND_EVIDENCE_SPEC.md` or the spec is updated with approved calibration changes.
- [ ] All inputs and outputs are bounded 0-100.
- [ ] Team strength remains separate from Tank Score.
- [ ] Confidence follows coverage/evidence rules and is not presented as probability.
- [ ] Calculation is deterministic for a fixed snapshot.
- [ ] Unit tests cover edge cases and representative team profiles.

## ATT-304 — Add editorial overrides and score explanations

Priority: High  
Estimate: 3  
Labels: `scoring`, `content`, `trust-safety`

Depends on: ATT-303

### Objective

Allow visible, expiring human judgment without destroying the calculated baseline.

### Acceptance criteria

- [ ] Overrides retain original value, published value, reason, evidence IDs, author, time, and review/expiration date.
- [ ] Expired overrides no longer apply and are surfaced for review.
- [ ] Tier D evidence cannot support an override.
- [ ] Every published score receives a concise explanation based on components/evidence.
- [ ] Automated regeneration preserves valid editorial overrides.

## ATT-305 — Backtest 2025-26 cases and controls

Priority: Urgent  
Estimate: 5  
Labels: `scoring`, `testing`, `documentation`

Depends on: ATT-303, ATT-304

### Objective

Test whether the score finds known competitive-integrity incidents without flagging every weak or injured team.

### Scope

- Final six to eight weeks of the 2025-26 regular season where data is available.
- Utah and Indiana official February cases.
- Poor-but-trying, documented-rest/injury, and no-pick-incentive control cases.
- Limitations report.

### Acceptance criteria

- [ ] Reproducible backtest fixtures and command exist.
- [ ] Known events produce explainable component movement.
- [ ] At least three meaningful control profiles are assessed.
- [ ] False positives and missing inputs are documented, not hidden.
- [ ] Report recommends keep/change decisions for weights and thresholds.

## ATT-306 — Calibrate thresholds and publish methodology v1

Priority: High  
Estimate: 3  
Labels: `scoring`, `documentation`

Depends on: ATT-305

### Objective

Turn the provisional model into the first public methodology version.

### Acceptance criteria

- [ ] Weight/threshold decisions reference backtest evidence.
- [ ] Score bands and confidence rules are internally consistent.
- [ ] Methodology version is set to `1.0.0` or an approved equivalent.
- [ ] Limitations and known blind spots are public.
- [ ] A migration note explains changes from the provisional version.

## Sprint 3 demo

- Compare a weak-but-trying profile with a high-incentive/high-anomaly profile.
- Walk through pick-control cases.
- Show an injury guardrail.
- Run the historical backtest and review score movement.
- Apply and expire an editorial override.

## Sprint 3 exit gate

- ATT-301 through ATT-306 complete.
- Backtest findings have owner review.
- No unresolved false-positive pattern makes the score unsafe to display.

