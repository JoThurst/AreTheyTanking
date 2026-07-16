# Sprint 1 — Static MVP

Duration: 1 week  
Goal: Deliver the complete core experience using curated static data.  
Exit milestone: Manual static MVP

## ATT-101 — Build responsive league team grid

Priority: Urgent  
Estimate: 5  
Labels: `frontend`

Depends on: ATT-003, ATT-005

### Objective

Show all 30 teams in a scannable league view that immediately distinguishes strength from tanking signal.

### Scope

- Responsive grid and team-card component.
- Team identity, record, state, Tank Score, band, confidence, delta, summary, and update time.
- Draft-class context banner.
- Text labels in addition to color.

### Acceptance criteria

- [ ] Exactly 30 cards render from data, not hardcoded markup.
- [ ] Every card links to its stable team route.
- [ ] Strength and Tank Score cannot be visually confused.
- [ ] High scores with low confidence display both facts clearly.
- [ ] Card layouts remain readable at 360px and large desktop widths.

### Verification

- Component tests for representative score/confidence combinations.
- Manual mobile and desktop check.

## ATT-102 — Add sorting, filtering, and URL state

Priority: High  
Estimate: 3  
Labels: `frontend`

Depends on: ATT-101

### Objective

Let visitors quickly inspect the league from different perspectives.

### Scope

- Sort by Tank Score, change, record, recent form, and confidence.
- Filter by conference, competitive state, and confidence.
- Preserve state in the URL where practical.
- Reset control and results count.

### Acceptance criteria

- [ ] All sort options are deterministic with defined tie breakers.
- [ ] Filters combine correctly.
- [ ] A copied supported URL restores state.
- [ ] Keyboard users can operate every control.
- [ ] No-results state explains how to reset.

## ATT-103 — Build team detail routes

Priority: High  
Estimate: 5  
Labels: `frontend`, `content`

Depends on: ATT-101

### Objective

Provide an explainable team-specific page suitable for direct sharing.

### Scope

- Stable route for each team.
- Score, state, confidence, update time, and summary.
- Strength, draft incentive, and competitive intent.
- Component breakdown.
- Pick context and evidence placeholders.
- Offseason label.

### Acceptance criteria

- [ ] All 30 routes build successfully.
- [ ] Unknown inputs show as unknown, not zero.
- [ ] Every component has a plain-language explanation.
- [ ] Pick verification date is shown when pick context exists.
- [ ] Direct navigation and browser back behavior work.

## ATT-104 — Build methodology and source-policy pages

Priority: High  
Estimate: 2  
Labels: `frontend`, `documentation`, `trust-safety`

Depends on: ATT-004

### Objective

Publish the rules needed to interpret the site responsibly.

### Acceptance criteria

- [ ] Methodology version and score bands render.
- [ ] Evidence tiers and social limitations render.
- [ ] Injury and false-positive guardrails render.
- [ ] Methodology is linked from the homepage and each team page.
- [ ] Source links are accessible and clearly outbound.

## ATT-105 — Add offseason, stale-data, empty, and error states

Priority: High  
Estimate: 3  
Labels: `frontend`, `data-pipeline`

Depends on: ATT-101, ATT-103

### Objective

Prevent incomplete or old data from looking current and authoritative.

### Acceptance criteria

- [ ] Offseason mode says that live deployment signals are unavailable.
- [ ] Stale state shows source age and last successful update.
- [ ] Unknown component data does not break a page.
- [ ] Missing team routes produce a useful not-found experience.
- [ ] Simulated invalid data fails validation rather than rendering silently.

## ATT-106 — Complete MVP accessibility and responsive QA

Priority: High  
Estimate: 3  
Labels: `testing`, `frontend`

Depends on: ATT-101 through ATT-105

### Objective

Validate that the full manual MVP is usable and understandable.

### Acceptance criteria

- [ ] Full site is keyboard navigable.
- [ ] Visible focus and semantic heading order pass review.
- [ ] Score meaning is available without relying on color.
- [ ] Key viewports have no horizontal page overflow.
- [ ] Production build passes automated accessibility smoke checks.
- [ ] “Bad but trying” can be identified from the homepage presentation.

## Sprint 1 demo

- Sort all teams by Tank Score.
- Filter to a conference and state.
- Open a team page and explain the three underlying measures.
- Show offseason and stale-data states.
- Navigate the core flow using only a keyboard.

## Sprint 1 exit gate

- ATT-101 through ATT-106 complete.
- All 30 teams have reviewed placeholder/curated summaries.
- The product is understandable before any automated scoring exists.

