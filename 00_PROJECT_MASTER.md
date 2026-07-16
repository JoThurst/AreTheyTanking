# Are They Tanking? — Project Master

Status: Planning baseline  
Planning date: 2026-07-16  
Primary audience: NBA fans who want a quick but defensible view of every team's competitive direction  
Working tagline: **Bad, rebuilding, or actually tanking?**

## 1. Product thesis

Are They Tanking? is a static, frequently refreshed NBA tracker that shows all 30 teams along three distinct dimensions:

1. **Team strength** — how competitive the current roster is.
2. **Draft incentive** — how much the franchise benefits from losing, accounting for pick ownership, protections, lottery position, and the perceived quality of the next draft.
3. **Competitive intent** — whether the team is deploying its strongest reasonably available roster and behaving as though current wins matter.

The public-facing Tank Score summarizes the evidence, but the score explanation is more important than the number. Losing alone is never treated as proof of tanking.

## 2. Why the project is timely

The NBA escalated its response to competitive-integrity concerns during the 2025-26 season. It fined Utah $500,000 for removing playable top players from competitive fourth quarters and Indiana $100,000 under the Player Participation Policy. The league then approved the new 3-2-1 Lottery for the 2027 through 2029 drafts, including draft relegation for the bottom three teams and expanded disciplinary authority.

Primary references:

- [NBA fines Utah and Indiana](https://official.nba.com/nba-fines-utah-jazz-and-indiana-pacers/)
- [NBA approves the 3-2-1 Lottery](https://www.nba.com/news/nba-board-governors-approve-new-draft-lottery-system)
- [NBA 2025-26 injury reports](https://official.nba.com/nba-injury-report-2025-26-season/)

The 2026 draft was widely regarded as unusually strong. Early 2027 analysis is much cooler: current reporting generally identifies Tyran Stokes as the clearest top prospect while describing the rest of the class as less certain. This contrast validates draft-class strength as a tracked, changing input rather than a permanent assumption.

Current draft references:

- [2026 class described as one of the decade's strongest](https://www.nba.com/news/the-athletic-2026-nba-draft-top-100-prospects)
- [Early 2027 class assessment](https://www.si.com/nba/nba-draft/way-too-early-2027-nba-draft-big-board-top-30-prospects)
- [Associated Press early 2027 overview](https://www.nbclosangeles.com/nba/2027-nba-draft-early-top-prospects/3909321/)

## 3. Core experience

### Homepage

- All 30 team cards.
- Sort by Tank Score, confidence, record, recent form, or score change.
- Filter by conference and competitive state.
- Each card shows score, state, confidence, change, last updated, and a one-sentence explanation.
- A league-level Draft Incentive banner explains the current draft-class outlook and the applicable lottery rules.

### Team page

- Tank Score and confidence.
- Separate team-strength, draft-incentive, and competitive-intent measures.
- Component breakdown and human-readable explanation.
- Pick-control and protection summary.
- Availability and rotation context.
- Evidence timeline with source, date, evidence tier, and status.
- Historical score chart after snapshots exist.

### Methodology page

- Exact definitions and score bands.
- What does and does not count as tanking evidence.
- Source-quality rules.
- Injury and false-positive protections.
- Score version and change history.

## 4. Product principles

1. **Bad is not the same as tanking.** Team strength is displayed separately from intent.
2. **Explain every score.** A score without evidence is incomplete.
3. **Social discussion is discovery, not proof.** Reddit and social chatter can create a research lead but cannot directly raise a Tank Score.
4. **Injuries receive a presumption of legitimacy.** Availability anomalies must be corroborated before scoring.
5. **Draft incentives are contextual.** Pick control, protections, lottery rules, and class quality all matter.
6. **Recency matters.** Behavioral evidence decays unless it continues.
7. **Editorial overrides are visible.** Manual judgment must include an author note, timestamp, reason, and expiration/review date.
8. **Static delivery, dynamic build.** The browser reads generated JSON; scheduled jobs do the data collection and scoring.

## 5. MVP scope

The MVP is an evidence-backed static ranking, not a machine-learning model.

Included:

- 30-team static grid and detail pages.
- Manually curated team state and evidence.
- Automated standings, record, last-10 form, and core team metrics.
- Draft-pick incentive field, initially verified manually.
- Tank Score v1 with component explanations and confidence.
- Methodology and source-policy pages.
- Weekly snapshots.
- Offseason mode and regular-season mode.

Excluded until after validation:

- Public voting on whether a team is tanking.
- Fully automated natural-language accusations.
- A model that infers medical truth.
- Real-time play-by-play classification.
- User accounts, comments, or an admin dashboard.
- Betting recommendations.

## 6. Recommended technical shape

- **Frontend:** Astro with TypeScript and lightweight client-side JavaScript.
- **Styling:** project-owned CSS tokens; optional Tailwind only if the repository already standardizes on it.
- **Content:** generated JSON plus Markdown methodology/editorial pages.
- **Data jobs:** Python scripts, allowing reuse of YunoBall data and existing Python experience.
- **Validation:** JSON Schema or Pydantic at generation time; TypeScript types at render time.
- **Automation:** scheduled GitHub Actions with last-known-good output retained on ingestion failure.
- **Hosting:** GitHub Pages or Cloudflare Pages.
- **Analytics:** privacy-conscious page and outbound-share measurement after launch.

The existing YunoBall team game stats, odds, daily metrics, flags, and schedule factors should be reused where possible. The public site should consume an exported snapshot rather than query the database from the browser.

## 7. Operating modes

### Offseason

- Label the product **2026-27 Competitive Outlook**.
- Focus on roster direction, pick control, transactions, prospect incentive, and organizational statements.
- Do not imply that game-deployment signals are current.

### Regular season

- Refresh quantitative data daily.
- Run the research discovery sweep daily or after games.
- Publish reviewed editorial changes at least weekly.

### Late season

- Increase availability and rotation monitoring.
- Track elimination status and lottery-position incentives.
- Increase research cadence around the trade deadline, All-Star break, and final six weeks.

## 8. Success criteria

The first public beta is successful when:

- All 30 teams have fresh, schema-valid data.
- Every score above 60 has at least two supporting evidence items, including at least one Tier A-C item.
- Every team card explains its score in plain language.
- The score does not automatically flag documented injuries as tanking.
- Historical backtesting identifies the known Utah and Indiana 2025-26 incidents without simply ranking every poor team as a tanker.
- Scheduled data failure leaves the previous valid site online with a visible stale-data warning.
- A new visitor can distinguish “bad team” from “tanking signal” without reading the full methodology.

## 9. Source-of-truth documents

Use these in precedence order:

1. `01_PRODUCT_REQUIREMENTS.md` — what the product must do.
2. `02_SCORING_AND_EVIDENCE_SPEC.md` — how scores and evidence work.
3. `03_RESEARCH_AND_DATA_PLAN.md` — how information is collected and reviewed.
4. `04_MASTER_ROADMAP.md` — sequencing, milestones, and gates.
5. Sprint documents — implementation tasks for the current sprint.
6. `05_IDEAS_BACKLOG.md` — uncommitted concepts, not requirements.

Material changes to scoring, evidence standards, or scope must update the relevant master document before implementation.

## 10. Decisions still requiring owner approval

- Final visual tone: serious analytics, playful “Tank Commander,” or a controlled combination.
- Whether the initial public score is called **Tank Score**, **Tank Signal**, or **Competitive Intent Index**.
- Whether YunoBall exports directly during CI or publishes a separate sanitized artifact.
- Whether official team logos are used; the lower-risk initial option is original team-name typography and color treatments with a non-affiliation notice.
- Whether the public beta launches during the offseason or waits for the first 10-15 games of 2026-27.

