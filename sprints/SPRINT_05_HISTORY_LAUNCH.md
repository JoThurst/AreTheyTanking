# Sprint 5 — History, Sharing, and Public Beta

Duration: 1 week  
Goal: Make score movement useful, complete trust/quality work, and launch a maintainable public beta.  
Exit milestone: Public beta

## ATT-501 — Persist and render historical snapshots

Priority: Urgent  
Estimate: 5  
Labels: `data-pipeline`, `frontend`

Depends on: ATT-303

### Objective

Make score changes reproducible and visible over time.

### Scope

- Immutable dated snapshots.
- Retention strategy.
- Team history data and basic accessible visualization/table.
- Methodology-version markers.

### Acceptance criteria

- [ ] Every successful publication can create one immutable snapshot.
- [ ] Duplicate reruns for the same logical snapshot are idempotent.
- [ ] Team pages show history when two or more points exist.
- [ ] Methodology changes are identifiable on history.
- [ ] Historical data can be reconstructed without live upstream access.

## ATT-502 — Add score changes and league trend views

Priority: High  
Estimate: 3  
Labels: `frontend`, `content`

Depends on: ATT-501

### Objective

Give returning visitors an immediate answer to what changed.

### Scope

- Seven-day change.
- Biggest risers/fallers.
- Short component/evidence-based change explanation.
- No-change and insufficient-history states.

### Acceptance criteria

- [ ] Delta uses comparable methodology or warns when versions differ.
- [ ] Change explanation identifies components/evidence rather than restating the delta.
- [ ] Insufficient history never appears as zero movement.
- [ ] Trend view is responsive and keyboard accessible.

## ATT-503 — Add SEO and share metadata

Priority: High  
Estimate: 3  
Labels: `frontend`, `content`

Depends on: ATT-103

### Objective

Make league and team pages understandable when found or shared.

### Acceptance criteria

- [ ] Unique title, description, canonical URL, and social metadata exist for homepage and team pages.
- [ ] Shared description includes score label and confidence without overstating certainty.
- [ ] Sitemap and robots configuration match launch intent.
- [ ] Invalid or filtered URLs do not generate duplicate canonical pages.
- [ ] Social preview avoids official-logo use unless approved.

## ATT-504 — Add corrections, attribution, and non-affiliation content

Priority: High  
Estimate: 2  
Labels: `trust-safety`, `documentation`, `content`

Depends on: ATT-104

### Objective

Provide transparent recourse and source handling for a potentially contentious ranking.

### Acceptance criteria

- [ ] Correction/contact path exists.
- [ ] Source attribution and outbound-link policy are visible.
- [ ] Site states it is unaffiliated with the NBA and its teams.
- [ ] Methodology change log is public.
- [ ] Claims remain summaries rather than copied article text.

## ATT-505 — Complete production QA and failure drills

Priority: Urgent  
Estimate: 5  
Labels: `testing`, `infrastructure`, `trust-safety`

Depends on: ATT-501 through ATT-504

### Objective

Verify functionality, trust guardrails, and operational resilience before public traffic.

### Acceptance criteria

- [ ] Lint, typecheck, unit, integration, accessibility smoke, schema validation, and production build pass.
- [ ] All 30 team routes and core filters are smoke-tested.
- [ ] Mobile and desktop manual QA pass.
- [ ] Failed ingestion, invalid data, stale data, expired override, missing source, and methodology-version-change drills pass.
- [ ] No Tier D item affects a production score.
- [ ] Every score above 60 has the required evidence coverage or is clearly low-confidence/offseason provisional.
- [ ] Performance target is met or exceptions are documented.

## ATT-506 — Deploy and document launch operations

Priority: Urgent  
Estimate: 3  
Labels: `infrastructure`, `documentation`

Depends on: ATT-505

### Objective

Launch the public beta with a repeatable review and update routine.

### Scope

- Production deployment.
- Domain/custom-domain decision if available.
- Analytics decision.
- Daily automation and weekly editorial schedule.
- Launch checklist and rollback path.

### Acceptance criteria

- [ ] Production URL serves the reviewed dataset.
- [ ] Scheduled update and manual rerun work in production.
- [ ] Rollback/last-known-good procedure is documented and tested.
- [ ] Weekly editorial owner checklist exists.
- [ ] Launch version and methodology version are recorded.
- [ ] Post-launch issues are captured in Linear rather than patched without tracking.

## Sprint 5 demo

- Show team score history and league risers/fallers.
- Share a team URL and inspect preview metadata.
- Run a controlled failure drill.
- Walk through correction and methodology pages.
- Open the production public beta.

## Sprint 5 exit gate

- ATT-501 through ATT-506 complete.
- All 30 launch records receive owner review.
- Public claims and sources are conservative, current, and reproducible.
- Daily factual refresh and weekly editorial review have named ownership.

