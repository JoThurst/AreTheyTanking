# Linear Backlog Index

Use the sprint documents for full issue bodies. This is the cross-sprint planning view.

| ID | Sprint | Title | Priority | Estimate | Depends on |
| --- | --- | --- | --- | --- | --- |
| ATT-001 | 0 | Initialize static application and quality tooling | High | 3 | — |
| ATT-002 | 0 | Define team, score, snapshot, and evidence schemas | Urgent | 3 | — |
| ATT-003 | 0 | Create all-30-team seed dataset | High | 2 | ATT-002 |
| ATT-004 | 0 | Encode methodology and evidence policy as project content | High | 2 | ATT-002 |
| ATT-005 | 0 | Establish design tokens and low-fidelity page structure | Medium | 2 | ATT-001 |
| ATT-006 | 0 | Add continuous validation workflow | High | 2 | ATT-001, ATT-002 |
| ATT-101 | 1 | Build responsive league team grid | Urgent | 5 | ATT-003, ATT-005 |
| ATT-102 | 1 | Add sorting, filtering, and URL state | High | 3 | ATT-101 |
| ATT-103 | 1 | Build team detail routes | High | 5 | ATT-101 |
| ATT-104 | 1 | Build methodology and source-policy pages | High | 2 | ATT-004 |
| ATT-105 | 1 | Add offseason, stale-data, empty, and error states | High | 3 | ATT-101, ATT-103 |
| ATT-106 | 1 | Complete MVP accessibility and responsive QA | High | 3 | ATT-101–ATT-105 |
| ATT-201 | 2 | Build normalized core-stat ingestion adapter | Urgent | 5 | ATT-002 |
| ATT-202 | 2 | Add YunoBall export adapter or documented fallback | High | 5 | ATT-201 |
| ATT-203 | 2 | Generate validated public team data | Urgent | 3 | ATT-201, ATT-202 |
| ATT-204 | 2 | Implement last-known-good publication behavior | Urgent | 3 | ATT-203 |
| ATT-205 | 2 | Schedule ingestion and static deployment | High | 3 | ATT-203, ATT-204 |
| ATT-206 | 2 | Add freshness observability and runbook | Medium | 2 | ATT-205 |
| ATT-301 | 3 | Implement Draft Incentive v1 | Urgent | 5 | ATT-203 |
| ATT-302 | 3 | Implement competitive-deployment inputs | Urgent | 5 | ATT-203 |
| ATT-303 | 3 | Implement Tank Score and confidence engine | Urgent | 5 | ATT-301, ATT-302 |
| ATT-304 | 3 | Add editorial overrides and score explanations | High | 3 | ATT-303 |
| ATT-305 | 3 | Backtest 2025-26 cases and controls | Urgent | 5 | ATT-303, ATT-304 |
| ATT-306 | 3 | Calibrate thresholds and publish methodology v1 | High | 3 | ATT-305 |
| ATT-401 | 4 | Implement research discovery and evidence lifecycle | Urgent | 5 | ATT-002, ATT-306 |
| ATT-402 | 4 | Add official/news scheduled discovery | High | 5 | ATT-401 |
| ATT-403 | 4 | Add Reddit/social discovery without score coupling | High | 3 | ATT-401 |
| ATT-404 | 4 | Implement Draft Class Strength Index | High | 5 | ATT-401 |
| ATT-405 | 4 | Generate weekly research review packet | High | 3 | ATT-402–ATT-404 |
| ATT-406 | 4 | Render reviewed evidence timelines | High | 3 | ATT-401, ATT-405 |
| ATT-501 | 5 | Persist and render historical snapshots | Urgent | 5 | ATT-303 |
| ATT-502 | 5 | Add score changes and league trend views | High | 3 | ATT-501 |
| ATT-503 | 5 | Add SEO and share metadata | High | 3 | ATT-103 |
| ATT-504 | 5 | Add corrections, attribution, and non-affiliation content | High | 2 | ATT-104 |
| ATT-505 | 5 | Complete production QA and failure drills | Urgent | 5 | ATT-501–ATT-504 |
| ATT-506 | 5 | Deploy and document launch operations | Urgent | 3 | ATT-505 |

## Recommended Linear relationships

- Create each Sprint as a Linear cycle.
- Add every issue to the `Are They Tanking?` project.
- Use “blocks/blocked by” relationships from the dependency column.
- Add requirement IDs to issue descriptions rather than creating duplicate requirement tickets.
- Create bugs found during a sprint as child or linked issues; do not silently expand the originating issue.

