# Product Requirements

Version: 0.1  
Status: Ready for implementation planning

## 1. Objective

Build a static NBA team-state tracker that gives fans a fast, explainable answer to whether each franchise is competing, rebuilding, or showing evidence consistent with tanking.

## 2. Primary users

- NBA fans scanning the entire league.
- Fans investigating one team's direction.
- Social users opening a shared team page.
- The project owner reviewing research leads and publishing evidence-backed changes.

## 3. Required terminology

- **Tank Score:** 0-100 derived indicator of tanking-related behavior and incentives.
- **Competitive state:** editorial category describing the team's present direction.
- **Team strength:** performance/roster-quality measure that is not part of the accusation of intent.
- **Draft incentive:** benefit a team can receive from lower placement.
- **Competitive intent:** evidence that the team is or is not prioritizing current wins.
- **Confidence:** evidence-coverage assessment, not a probability that the score is correct.
- **Social Heat:** separate indicator of discussion volume; never part of Tank Score v1.

## 4. Competitive states

The system shall support:

1. Contender
2. Playoff Push
3. Play-In Fight
4. Crossroads
5. Development Season
6. Rebuilding
7. Tank Watch
8. Confirmed League Action

`Confirmed League Action` is an evidence badge/state overlay, not an assertion that every current decision is tanking.

## 5. Functional requirements

### League view

- **FR-001:** Display exactly 30 current NBA team cards from the active dataset.
- **FR-002:** Show team name, abbreviation, record, competitive state, Tank Score, confidence, score change, explanation, and updated timestamp.
- **FR-003:** Sort by Tank Score, score change, record, recent form, and confidence.
- **FR-004:** Filter by conference, competitive state, and confidence.
- **FR-005:** Support shareable query parameters for the active sort/filter state when practical.
- **FR-006:** Display the current draft-class incentive summary and current lottery-rule mode.
- **FR-007:** Display stale-data status without breaking the last-known-good experience.

### Team detail

- **FR-101:** Provide a stable route for every team.
- **FR-102:** Show Tank Score, score band, confidence, and updated timestamp.
- **FR-103:** Show team strength, draft incentive, and competitive intent separately.
- **FR-104:** Show component scores and the human-readable reason for each component.
- **FR-105:** Show current pick ownership/protection summary with verification date.
- **FR-106:** Show recent evidence in reverse chronological order.
- **FR-107:** Each evidence item must show title, source, date, evidence tier, review state, and outbound link when public.
- **FR-108:** Show score history when at least two snapshots exist.
- **FR-109:** Label offseason data so it cannot be mistaken for live in-season deployment analysis.

### Methodology and transparency

- **FR-201:** Publish score formula version and component definitions.
- **FR-202:** Publish evidence tiers and social-source limitations.
- **FR-203:** Explain that losing, youth, or injury alone is not tanking evidence.
- **FR-204:** Publish the latest material methodology changes.
- **FR-205:** Provide a correction/contact mechanism without requiring accounts.

### Data generation

- **FR-301:** Validate all generated team records before replacing production data.
- **FR-302:** Reject a build when team count, IDs, required fields, or score bounds are invalid.
- **FR-303:** Preserve the last-known-good dataset when upstream collection fails.
- **FR-304:** Store source and retrieval timestamps separately from site build time.
- **FR-305:** Support manual editorial overrides with reason, author, creation time, and review/expiration time.
- **FR-306:** Generate a machine-readable snapshot suitable for historical comparison.

### Research workflow

- **FR-401:** Store research discoveries separately from accepted scoring evidence.
- **FR-402:** Deduplicate discoveries by canonical URL plus normalized title/date.
- **FR-403:** Allow a research lead to be rejected, accepted as context, or accepted as scoring evidence.
- **FR-404:** Prevent Tier D social discoveries from directly modifying Tank Score.
- **FR-405:** Track draft-class assessment separately from team evidence.

## 6. Data contract: team summary

Minimum logical fields:

```json
{
  "teamId": "UTA",
  "season": "2026-27",
  "mode": "offseason",
  "competitiveState": "Rebuilding",
  "tankScore": 72,
  "scoreBand": "Tank Watch",
  "confidence": "medium",
  "teamStrength": 28,
  "draftIncentive": 81,
  "competitiveIntent": 44,
  "record": { "wins": 0, "losses": 0 },
  "scoreDelta7d": 4,
  "summary": "High draft incentive and a development-focused roster; live deployment evidence is unavailable in the offseason.",
  "updatedAt": "2026-07-16T14:00:00Z",
  "methodologyVersion": "1.0.0"
}
```

The implementation may normalize this across multiple files, but the rendered output must preserve these meanings.

## 7. Non-functional requirements

- **NFR-001 Performance:** Target a Lighthouse performance score of 90 or better on the production homepage under normal conditions.
- **NFR-002 Accessibility:** Keyboard navigation, visible focus, meaningful labels, non-color-only score communication, and WCAG AA contrast.
- **NFR-003 Responsive design:** Fully usable from 360px mobile width through desktop.
- **NFR-004 Reliability:** A failed ingestion must not publish partial or invalid data.
- **NFR-005 Auditability:** Every production score can be reconstructed from a versioned input snapshot and methodology version.
- **NFR-006 Security:** No database credentials or private source material are shipped to the browser.
- **NFR-007 Maintainability:** Calculation logic is separated from rendering and covered by unit tests.
- **NFR-008 Source integrity:** Published links retain source name and publication date.
- **NFR-009 SEO:** Unique title, description, canonical route, and social preview metadata for each team page.

## 8. Design requirements

- The score must always include a text label; color alone is insufficient.
- “Bad but trying” must be visually distinct from “Tank Watch.”
- Confidence must not resemble statistical certainty.
- Evidence above the fold is preferred to decorative complexity.
- Team branding must not imply NBA or team affiliation.

Suggested score bands:

| Score | Label |
| --- | --- |
| 0-19 | Full Competition |
| 20-39 | Competitive |
| 40-59 | Direction Unclear |
| 60-79 | Tank Watch |
| 80-100 | Strong Tank Signal |

## 9. Release acceptance criteria

- Requirements FR-001 through FR-007, FR-101 through FR-107, FR-201 through FR-204, and FR-301 through FR-305 pass.
- All 30 teams validate and render.
- No score explanation is blank or purely restates the number.
- No Tier D evidence affects Tank Score.
- Mobile, desktop, keyboard, and stale-data states are manually tested.
- The source and non-affiliation notices are visible.

