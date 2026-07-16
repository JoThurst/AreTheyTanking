# Sprint 4 — Research, News, Social Discovery, and Draft Context

Duration: 1 week  
Goal: Build a sustainable evidence workflow that uses web/news/Reddit research without confusing popularity with truth.  
Exit milestone: Editorial beta

## ATT-401 — Implement research discovery and evidence lifecycle

Priority: Urgent  
Estimate: 5  
Labels: `research`, `data-pipeline`, `trust-safety`

Depends on: ATT-002, ATT-306

### Objective

Store unreviewed discoveries separately from accepted context and scoring evidence.

### Scope

- Evidence states, deduplication, canonical URLs, corroboration links, component mapping, reviewer notes, and expiration.
- CLI or file-based review workflow; no admin UI required.

### Acceptance criteria

- [ ] Lifecycle supports discovered, needs review, accepted context, accepted scoring, rejected, and superseded.
- [ ] Canonical URL/title/date deduplication works.
- [ ] Accepted scoring evidence requires Tier A-C and a score component.
- [ ] Tier D evidence is rejected from scoring at schema and application layers.
- [ ] Review actions are timestamped and attributable.

## ATT-402 — Add official/news scheduled discovery

Priority: High  
Estimate: 5  
Labels: `research`, `data-pipeline`

Depends on: ATT-401

### Objective

Find official league action, participation/availability changes, transactions, and credible reporting for review.

### Scope

- Query templates from the research plan.
- Official NBA/team sources first.
- Established news/beat sources as secondary discovery.
- Store metadata and a short neutral claim summary.
- Respect source access terms; do not republish article bodies.

### Acceptance criteria

- [ ] Scheduled and manual discovery modes exist.
- [ ] Results retain publisher, author if available, publication/event date, retrieval date, URL, and proposed tier.
- [ ] Syndicated duplicates are collapsed where detectable.
- [ ] No discovery auto-publishes a score change.
- [ ] Source failure is reported without blocking other sources.

## ATT-403 — Add Reddit/social discovery without score coupling

Priority: High  
Estimate: 3  
Labels: `research`, `trust-safety`

Depends on: ATT-401

### Objective

Use popular NBA communities to find incidents and narratives worth investigating while keeping social activity separate from evidence.

### Scope

- Search `r/nba`, `r/NBA_Draft`, and team subreddits through permitted public discovery mechanisms.
- Store thread URL, title, date, community, engagement metadata if available, and mentioned team/player.
- Optional Social Heat output kept outside Tank Score.

### Acceptance criteria

- [ ] Every social item is Tier D by default.
- [ ] Social items cannot be promoted to scoring without a separate corroborating Tier A-C item.
- [ ] No authenticated/private content is accessed.
- [ ] Deleted/unavailable links are handled without breaking generation.
- [ ] Search queries and collection limits are documented.
- [ ] Social Heat, if implemented, is visibly separate from evidence confidence.

## ATT-404 — Implement Draft Class Strength Index

Priority: High  
Estimate: 5  
Labels: `research`, `scoring`, `content`

Depends on: ATT-401

### Objective

Track how attractive the next draft appears because class strength materially changes tanking incentives.

### Scope

- Draft assessment schema and versioned reviews.
- Top-prospect quality, top-five depth, lottery depth, first-round depth, and evaluator consensus.
- Independent-source identity to prevent repeated reporting from looking like consensus.
- 2026 historical comparison and 2027 initial low-confidence assessment.

### Acceptance criteria

- [ ] Index produces score, confidence, tier counts, summary, sources, review date, and delta.
- [ ] Multiple articles repeating one evaluator count once for consensus.
- [ ] A change greater than 10 points requires explicit reviewer approval.
- [ ] 2027 initial assessment is labeled early/low confidence.
- [ ] Draft index affects only the bounded Draft Incentive component.
- [ ] Site displays why the class rating changed.

## ATT-405 — Generate weekly research review packet

Priority: High  
Estimate: 3  
Labels: `research`, `documentation`

Depends on: ATT-402, ATT-403, ATT-404

### Objective

Produce one manageable owner-review artifact instead of a stream of automated conclusions.

### Acceptance criteria

- [ ] Packet lists new Tier A-B discoveries, quantitative anomalies, high-engagement social leads, contradictions, draft changes, and source failures.
- [ ] Items are grouped by team and urgency.
- [ ] Proposed action is review/reject/corroborate, never automatic accusation.
- [ ] Packet links to source and internal evidence ID.
- [ ] Empty sections render cleanly.

## ATT-406 — Render reviewed evidence timelines

Priority: High  
Estimate: 3  
Labels: `frontend`, `content`, `research`

Depends on: ATT-401, ATT-405

### Objective

Show visitors what changed and which sources support the current score.

### Acceptance criteria

- [ ] Only reviewed public evidence appears.
- [ ] Evidence shows tier, source, event date, claim summary, and link.
- [ ] Context-only evidence is distinguishable from scoring evidence.
- [ ] Social links are labeled discussion/discovery, not proof.
- [ ] Expired evidence remains historical without implying current scoring effect.

## Sprint 4 demo

- Discover an official item, a news report, and a Reddit thread.
- Show that only reviewed Tier A-C evidence can affect scoring.
- Generate the weekly review packet.
- Review the 2027 Draft Class Strength assessment and its low confidence.
- Render a team evidence timeline.

## Sprint 4 exit gate

- ATT-401 through ATT-406 complete.
- Research automation cannot bypass human review.
- Draft-class and social signals are visible but correctly bounded.

