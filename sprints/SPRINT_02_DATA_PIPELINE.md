# Sprint 2 — Core Data Pipeline

Duration: 1 week  
Goal: Automate factual team data while keeping editorial judgment controlled.  
Exit milestone: Reliable hosted alpha

## ATT-201 — Build normalized core-stat ingestion adapter

Priority: Urgent  
Estimate: 5  
Labels: `data-pipeline`

Depends on: ATT-002

### Objective

Normalize standings, games, and team-performance inputs behind a replaceable adapter.

### Scope

- Define source adapter interface.
- Retrieve or ingest standings, record, last-10 form, net rating, schedule, and source timestamps.
- Cache raw inputs for reproducibility.
- Map provider IDs to canonical team IDs.
- Represent unavailable data explicitly.

### Acceptance criteria

- [ ] Adapter produces schema-valid normalized output for all available teams.
- [ ] Provider-specific shapes do not leak into UI components.
- [ ] Source, retrieved time, and event/as-of time are distinct.
- [ ] Mapping errors fail loudly.
- [ ] Fixture-based tests do not require live network access.

## ATT-202 — Add YunoBall export adapter or documented fallback

Priority: High  
Estimate: 5  
Labels: `data-pipeline`, `infrastructure`

Depends on: ATT-201

### Objective

Reuse existing YunoBall metrics without coupling the public site to a live database.

### Scope

- Decide between read-only CI export, published sanitized artifact, or deferred integration.
- Map available team game stats, daily metrics, odds, and schedule factors.
- Keep credentials server-side.
- Document missing fields and fallback behavior.

### Acceptance criteria

- [ ] Chosen approach is documented with security and failure tradeoffs.
- [ ] No credentials or private connection strings enter built assets.
- [ ] Export is deterministic for a fixed source snapshot.
- [ ] Missing YunoBall availability does not block a curated/local build.
- [ ] Odds-derived fields are labeled as market context, not proof of intent.

## ATT-203 — Generate validated public team data

Priority: Urgent  
Estimate: 3  
Labels: `data-pipeline`, `testing`

Depends on: ATT-201, ATT-202

### Objective

Merge automated facts with protected editorial content into the production dataset.

### Acceptance criteria

- [ ] Generated output contains exactly 30 teams.
- [ ] Automated generation does not overwrite editorial evidence, summaries, states, or overrides.
- [ ] Every required field validates before publication.
- [ ] Output ordering and serialization are deterministic.
- [ ] A generation manifest records input versions and methodology version.

## ATT-204 — Implement last-known-good publication behavior

Priority: Urgent  
Estimate: 3  
Labels: `data-pipeline`, `infrastructure`, `testing`

Depends on: ATT-203

### Objective

Keep the prior valid site online when data retrieval or validation fails.

### Acceptance criteria

- [ ] Failed retrieval does not replace public data.
- [ ] Failed validation does not replace public data.
- [ ] Last success time and current failure/stale state are available to the site.
- [ ] Failure simulation is covered by automated tests.
- [ ] Failure output identifies the source and step without exposing secrets.

## ATT-205 — Schedule ingestion and static deployment

Priority: High  
Estimate: 3  
Labels: `infrastructure`, `data-pipeline`

Depends on: ATT-203, ATT-204

### Objective

Run core updates without maintaining a web server.

### Scope

- Scheduled GitHub Action.
- Manual dispatch.
- Validate, generate, build, and deploy only after all gates pass.
- Store or commit snapshots according to the chosen architecture.

### Acceptance criteria

- [ ] Scheduled and manual runs work.
- [ ] Deployment occurs only after validation and build success.
- [ ] Concurrency prevents an older run from overwriting a newer one.
- [ ] Secrets are referenced through protected configuration.
- [ ] Hosted output shows the correct update timestamp.

## ATT-206 — Add freshness observability and runbook

Priority: Medium  
Estimate: 2  
Labels: `documentation`, `infrastructure`

Depends on: ATT-205

### Objective

Make failed or stale updates diagnosable without reconstructing the pipeline.

### Acceptance criteria

- [ ] Runbook covers normal run, manual rerun, source failure, invalid data, and rollback to last-known-good.
- [ ] Logs contain source freshness and team-count summaries.
- [ ] The site exposes stale status without exposing infrastructure detail.
- [ ] Ownership of manual editorial refresh is documented.

## Sprint 2 demo

- Generate all team data from fixtures/live approved sources.
- Show automated facts merged with unchanged editorial content.
- Trigger a controlled invalid input and demonstrate no bad deployment occurs.
- Run manual scheduled workflow and open the hosted alpha.

## Sprint 2 exit gate

- ATT-201 through ATT-206 complete.
- Automated factual data is reliable enough to support scoring work.
- YunoBall integration is implemented or has a deliberate documented fallback.

