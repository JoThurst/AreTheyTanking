# Grok + Cursor + Linear Handoff Guide

## 1. Purpose

This document is the execution contract for assigning the project to Grok in Cursor while tracking work in Linear.

Grok should implement one Linear issue at a time. Sprint documents define issue scope; master documents define product behavior. If they conflict, the precedence in `00_PROJECT_MASTER.md` applies.

## 2. Repository document order

Before beginning the first issue, read:

1. `00_PROJECT_MASTER.md`
2. `01_PRODUCT_REQUIREMENTS.md`
3. `02_SCORING_AND_EVIDENCE_SPEC.md`
4. `03_RESEARCH_AND_DATA_PLAN.md`
5. `04_MASTER_ROADMAP.md`
6. The active sprint file

Read only relevant sections again for later issues; do not reinterpret settled terms silently.

## 3. Linear setup

Recommended project: `Are They Tanking?`  
Recommended cycles: `Sprint 0` through `Sprint 5`, one week each  
Recommended labels:

- `frontend`
- `data-pipeline`
- `scoring`
- `research`
- `content`
- `infrastructure`
- `testing`
- `documentation`
- `trust-safety`
- `blocked-owner-decision`

Priorities:

- Urgent: blocks the active sprint goal.
- High: required for the sprint gate.
- Medium: required but can follow the critical path.
- Low: stretch or cleanup.

Estimates:

- 1: less than half a day.
- 2: roughly half to one day.
- 3: one to two days.
- 5: two to three days or meaningful uncertainty.
- 8: split before implementation.

## 4. Standard issue body

Every Linear issue should contain:

```markdown
## Objective
What user or system outcome this issue creates.

## Context
Relevant requirement IDs and document sections.

## Scope
- Included behavior.
- Explicit boundaries.

## Implementation notes
Constraints and likely files/components; not a mandatory rewrite plan.

## Acceptance criteria
- [ ] Observable, testable result.

## Verification
- Commands, unit tests, build checks, and manual cases.

## Dependencies
Blocking issue IDs or owner decisions.
```

## 5. Sprint kickoff prompt

Copy this into Cursor at the start of a sprint:

```text
You are implementing Sprint {N} for Are They Tanking?. Read the project master documents and sprints/SPRINT_{NN}_*.md before changing code. Review the repository's current state and map the sprint's Linear issues to concrete files and dependencies.

Work one Linear issue at a time in dependency order. Do not expand MVP scope or change the scoring/evidence rules silently. If an issue requires a product decision, stop that issue, describe the options and tradeoffs, and mark it blocked-owner-decision. Preserve existing work and make targeted changes.

For each completed issue: implement the acceptance criteria, add proportional tests, run the relevant checks, update the Linear issue with files changed and verification results, and identify any follow-up issue rather than hiding deferred work.
```

## 6. Single-issue prompt

```text
Implement Linear issue {ATT-###}: {title}.

First read the issue, the referenced requirements, and the active sprint document. Inspect the current implementation before proposing changes. Return a concise plan, then implement only the issue scope. Preserve unrelated changes.

Completion requires:
1. Every acceptance criterion is addressed.
2. Relevant automated tests are added or updated.
3. The appropriate lint/typecheck/test/build commands pass.
4. Documentation or schemas are updated if behavior changed.
5. The final response lists files changed, verification results, assumptions, and remaining risks.

Do not infer medical intent, let social sources change Tank Score, or change scoring weights without updating the scoring specification and recording why.
```

## 7. Required completion comment

```markdown
### Completed
- Outcome delivered
- Important implementation decisions

### Files
- `path/to/file`: purpose

### Verification
- `command`: pass/fail
- Manual cases checked

### Assumptions / risks
- None, or concise details

### Follow-ups
- Linked Linear issue, if needed
```

## 8. Agent guardrails

- Do not replace curated evidence with unsourced generated prose.
- Do not use a team's record as proof of intent.
- Do not ship database credentials or private inputs.
- Do not publish partial generated data after a failed job.
- Do not scrape authenticated sites or bypass access controls.
- Do not let Reddit/social evidence directly affect the score.
- Do not overwrite editorial notes during automated generation.
- Do not use team logos until the owner resolves the branding decision.
- Do not upgrade frameworks or add major dependencies unless required by the active issue.

## 9. Branch and commit convention

Suggested branch:

```text
att-{issue-number}-{short-slug}
```

Suggested commit:

```text
ATT-{number}: concise imperative outcome
```

One issue may use multiple commits when useful, but commits should not mix unrelated Linear issues.

## 10. Definition of done

An issue is done only when:

- Acceptance criteria are verifiably met.
- Tests/checks pass or the exact blocker is documented.
- No new known high-severity issue is hidden.
- Source-of-truth documents match changed behavior.
- Linear contains the completion comment.
- The change is reviewable without relying on Cursor chat history.

