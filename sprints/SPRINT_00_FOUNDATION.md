# Sprint 0 — Foundation

Duration: 1 week  
Goal: Create a stable repository, shared contracts, and product rules so later automation cannot silently redefine the product.  
Exit milestone: Product contract locked

## Sprint outcomes

- Runnable static application shell.
- Validated data contracts for teams, scores, evidence, and snapshots.
- Seed records for all 30 teams.
- Methodology/evidence-policy content represented in the application.
- Baseline page structure and design tokens.
- CI validation for every change.

## ATT-001 — Initialize static application and quality tooling

Priority: High  
Estimate: 3  
Labels: `frontend`, `infrastructure`

### Objective

Create the minimal Astro + TypeScript application and development workflow.

### Scope

- Initialize Astro with TypeScript strict mode.
- Add formatting, linting, typecheck, test, and production-build commands.
- Establish `src`, `content`, `data`, `scripts`, and `tests` boundaries.
- Add a minimal README with local commands.
- Avoid major UI libraries unless justified.

### Acceptance criteria

- [ ] Clean install succeeds from the lockfile.
- [ ] Local dev server renders a placeholder route.
- [ ] Lint, typecheck, test, and build commands exist and pass.
- [ ] No secrets or machine-specific paths are committed.
- [ ] Repository structure is documented.

### Verification

- Run dependency install from a clean checkout.
- Run lint, typecheck, tests, and production build.

## ATT-002 — Define team, score, snapshot, and evidence schemas

Priority: Urgent  
Estimate: 3  
Labels: `data-pipeline`, `scoring`, `trust-safety`

### Objective

Make the logical data contract executable and shared by generation and rendering.

### Scope

- Define season/mode, team summary, score components, evidence, source, draft assessment, override, and snapshot types.
- Add runtime schema validation.
- Define enums for states, bands, confidence, evidence tiers, and review statuses.
- Require source and review fields described in the master specifications.

### Acceptance criteria

- [ ] Valid representative objects pass validation.
- [ ] Missing required fields, invalid team IDs, invalid score bounds, and Tier D scoring evidence fail validation.
- [ ] Schema/type generation or parity is documented.
- [ ] Exactly one canonical list of 30 franchise IDs exists.
- [ ] Tests cover valid and invalid examples.

### Verification

- Run schema unit tests.
- Validate one team, one evidence item from each tier, one override, and one snapshot.

## ATT-003 — Create all-30-team seed dataset

Priority: High  
Estimate: 2  
Labels: `content`, `data-pipeline`

Depends on: ATT-002

### Objective

Provide complete curated data so the product can be built before live ingestion exists.

### Scope

- Add all current teams with stable IDs, names, abbreviations, conference, and division.
- Include placeholder/curated state, score, confidence, summary, and timestamps.
- Mark the dataset clearly as offseason planning data where applicable.
- Do not fabricate evidence; use `unknown` or empty evidence lists.

### Acceptance criteria

- [ ] Exactly 30 unique teams validate.
- [ ] No duplicate abbreviation or route slug exists.
- [ ] Every team has non-empty display metadata and a human-readable summary.
- [ ] Unknown fields are represented explicitly rather than as false zeros.
- [ ] A single command validates the complete seed dataset.

## ATT-004 — Encode methodology and evidence policy as project content

Priority: High  
Estimate: 2  
Labels: `documentation`, `trust-safety`, `content`

Depends on: ATT-002

### Objective

Make the scoring caveats and evidence rules publishable application content.

### Scope

- Add methodology version, score bands, evidence tiers, confidence meanings, injury guardrails, social-source rules, and change log.
- Use structured front matter or typed content where useful.
- Include non-affiliation and correction placeholders.

### Acceptance criteria

- [ ] Content covers FR-201 through FR-205.
- [ ] Score version is available to the rendering layer.
- [ ] Tier D discovery-only rule is explicit.
- [ ] “Bad is not tanking” and injury limitations are prominent.

## ATT-005 — Establish design tokens and low-fidelity page structure

Priority: Medium  
Estimate: 2  
Labels: `frontend`, `design`

Depends on: ATT-001

### Objective

Define a restrained visual system and page shells before building components.

### Scope

- Color, typography, spacing, radius, and score-band tokens.
- Homepage, team page, and methodology page shells.
- Non-color labels for all status colors.
- Default to team-name typography rather than official logos.

### Acceptance criteria

- [ ] Tokens support all score bands and meet contrast targets.
- [ ] Page shells work at 360px, tablet, and desktop widths.
- [ ] Focus styles are visible.
- [ ] No visual treatment implies official NBA affiliation.

## ATT-006 — Add continuous validation workflow

Priority: High  
Estimate: 2  
Labels: `infrastructure`, `testing`

Depends on: ATT-001, ATT-002

### Objective

Prevent invalid data or broken builds from merging unnoticed.

### Scope

- CI workflow for install, format/lint, typecheck, unit tests, data validation, and build.
- Dependency caching where safe.
- Clear failure output.

### Acceptance criteria

- [ ] Workflow runs on pull requests and the primary branch.
- [ ] Invalid seed data fails before the site build is accepted.
- [ ] A normal change completes with all required checks green.
- [ ] CI commands match documented local commands.

## Sprint 0 demo

- Run the app.
- Validate all 30 teams.
- Demonstrate a rejected invalid evidence item.
- Show CI results.
- Review terminology and visual direction decisions needing owner approval.

## Sprint 0 exit gate

- ATT-001 through ATT-006 complete.
- Owner decides the public score name or explicitly keeps `Tank Score` as the working term.
- No unresolved schema ambiguity blocks the league view.

