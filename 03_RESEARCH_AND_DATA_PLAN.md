# Research and Data Plan

Version: 0.1  
Status: Proposed operating plan

## 1. Objective

Collect enough current, source-ranked evidence to explain team direction without letting rumors or fan sentiment become factual claims.

The system has two distinct pipelines:

1. **Structured data pipeline:** standings, games, minutes, lineups, availability, schedule, odds, transactions, and pick context.
2. **Research pipeline:** official announcements, news, beat reporting, team statements, draft evaluation, and social discovery.

## 2. Structured sources

### Preferred internal inputs

Reuse YunoBall when coverage and licensing permit:

- Team game stats.
- Daily team metrics and flags.
- Schedule factors.
- Game odds and market expectations.
- Recent-form and net-rating calculations.

Export a sanitized versioned JSON file during a scheduled job. Never expose database credentials to the static site.

### Required external/context inputs

- NBA standings and game logs.
- Official NBA injury reports.
- Player game participation and minutes.
- Team transactions.
- Draft-pick ownership, swaps, and protections.
- Active draft-lottery rules.

Pick information is initially manually verified because protections and conveyance conditions are easy to misinterpret.

## 3. Research source hierarchy

1. NBA and team official releases.
2. Official injury reports, transactions, and game records.
3. Direct quotes and reporting from established national or local beat reporters.
4. Reputable analytical outlets with transparent evidence.
5. Reddit and other public social discussion as discovery only.

Conflicts are resolved in favor of the most direct, current, and authoritative evidence. Material disagreement is shown in the reviewer note rather than silently discarded.

## 4. Scheduled research cadence

### Daily during the regular season

- Search official NBA/team news for fines, investigations, participation-policy actions, shutdowns, and transactions.
- Review official injury reports for status changes involving top rotation players.
- Identify rotation/minutes anomalies from the most recent games.
- Run team-name plus tanking/competitive-intent discovery queries.
- Save leads; do not auto-publish editorial conclusions.

### Weekly

- Review all 30 team scores and explanations.
- Run a dedicated Reddit sweep of `r/nba`, `r/NBA_Draft`, and relevant team subreddits.
- Review score changes greater than 10 points.
- Confirm pick ownership/protection changes.
- Publish or reject the research queue.
- Generate a league summary: biggest risers, biggest fallers, and strongest new evidence.

### Draft research

- Offseason: monthly.
- College/international season: every two weeks.
- Event-driven: after major prospect performances, injuries, reclassification/eligibility changes, withdrawal decisions, and new consensus boards.

### High-risk periods

Increase cadence around:

- Trade deadline.
- All-Star break.
- First mathematical eliminations.
- Final six weeks of the regular season.
- Final 10 games.
- Lottery and draft withdrawal deadlines.

## 5. Query templates

Replace `{TEAM}`, `{PLAYER}`, and `{DRAFT_YEAR}`.

### Team behavior

- `"{TEAM}" tanking NBA`
- `"{TEAM}" "not trying to win" NBA`
- `"{TEAM}" healthy scratch veteran`
- `"{TEAM}" minutes restriction fourth quarter`
- `"{TEAM}" shutdown season`
- `"{TEAM}" development lineup`
- `"{PLAYER}" available did not play {TEAM}`
- `site:official.nba.com "{TEAM}" fined`

### Reddit/social discovery

- `site:reddit.com/r/nba "{TEAM}" tanking`
- `site:reddit.com/r/NBA_Draft "{TEAM}"`
- `site:reddit.com/r/{TEAM_SUBREDDIT} tanking`
- `site:reddit.com "{PLAYER}" "shut down" NBA`

### Draft strength

- `{DRAFT_YEAR} NBA Draft class strength scouts`
- `{DRAFT_YEAR} NBA Draft big board consensus`
- `{DRAFT_YEAR} NBA Draft top five depth`
- `{DRAFT_YEAR} NBA Draft weak strong class`
- `site:reddit.com/r/NBA_Draft {DRAFT_YEAR} class strength`

## 6. Social discovery rules

Reddit is useful for surfacing:

- Unusual rotations fans noticed.
- Local reporting that national searches missed.
- Team-specific context.
- Recurring public narratives worth investigating.
- Shareable discussion opportunities after the site has evidence.

Reddit cannot establish:

- Whether a player is medically able to play.
- Organizational intent.
- The truth of an anonymous claim.
- A score change without corroboration.

Store Social Heat separately using post count, recency, and engagement if desired. Do not merge it into Tank Score v1.

## 7. Research record schema

```json
{
  "id": "evidence-2026-02-12-uta-001",
  "teams": ["UTA"],
  "eventDate": "2026-02-09",
  "discoveredAt": "2026-02-12T18:00:00Z",
  "title": "NBA fines Utah Jazz",
  "canonicalUrl": "https://official.nba.com/...",
  "source": "NBA Official",
  "tier": "A",
  "status": "accepted_scoring",
  "claimSummary": "The league found that playable top players were removed before a competitive fourth quarter.",
  "components": ["deployment_anomaly", "official_action_signal"],
  "corroborates": [],
  "reviewedBy": "owner",
  "reviewedAt": "2026-02-12T20:00:00Z",
  "expiresAt": "2026-03-26T00:00:00Z"
}
```

## 8. Draft Class Strength research

Maintain a versioned draft assessment with:

- Consensus top tier.
- Top-five depth.
- Lottery depth.
- First-round depth.
- Evaluator agreement/disagreement.
- Major injuries or eligibility uncertainty.
- Source dates.
- Confidence and rationale.

Do not count multiple articles repeating one reporter as independent consensus. Track original evaluator/source identity.

Initial 2027 hypothesis for testing:

- Tyran Stokes is the early consensus top prospect.
- The class is currently viewed as less certain and likely weaker than 2025 and 2026.
- The assessment is low confidence before the 2026-27 college/international season.

This is a research starting point, not a permanent product conclusion.

## 9. Automation boundaries

Safe to automate:

- Retrieval, normalization, deduplication, freshness checks, anomaly detection, and research lead generation.
- Draft-board aggregation with source identity retained.
- Drafting a neutral evidence summary that requires review.

Requires review before publication:

- Changing competitive state.
- Accepting a source as scoring evidence.
- Publishing language about intent.
- Overriding an injury-related input.
- Changing draft-class strength by more than 10 points.

## 10. Data-quality checks

- Exactly 30 active teams.
- No future-dated events.
- No score outside 0-100.
- Source retrieval time is not confused with event/publication time.
- Injury data and participation data cover the same game/player.
- Pick ownership includes source and verification date.
- Duplicate syndicated articles are collapsed.
- Missing upstream data produces `unknown`, never an inferred zero.
- Every accepted scoring item references at least one score component.

## 11. Research output

The scheduled research job should produce a review packet containing:

- New Tier A-B discoveries.
- Quantitative anomalies needing explanation.
- High-engagement social leads.
- Potential contradictions.
- Suggested teams for manual review.
- Draft-class changes.
- Source failures or stale inputs.

The packet recommends investigation; it does not publish accusations.

