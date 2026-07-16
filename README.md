# Are They Tanking?

Evidence-backed NBA tracker that separates **team strength**, **draft incentive**, and **competitive intent**. Working tagline: _Bad, rebuilding, or actually tanking?_

This repository is a static Astro site fed by curated/generated JSON. Browsers never query a live database.

## Repository layout

| Path          | Purpose                                                 |
| ------------- | ------------------------------------------------------- |
| `src/`        | Astro pages, layouts, components, and render-time types |
| `content/`    | Methodology and editorial Markdown content              |
| `data/`       | Curated/generated JSON consumed by the site             |
| `scripts/`    | Validation and data-generation helpers                  |
| `tests/`      | Unit and component tests (Vitest)                       |
| `sprints/`    | Sprint implementation scopes                            |
| `*.md` (root) | Product source-of-truth documents                       |

## Prerequisites

- Node.js 20+

## Local commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run validate:data
npm run generate:seed
npm run build
npm run ci
```

| Command                 | What it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run dev`           | Local Astro development server                                    |
| `npm run lint`          | ESLint                                                            |
| `npm run typecheck`     | Astro check + TypeScript                                          |
| `npm run test`          | Vitest unit tests                                                 |
| `npm run validate:data` | Schema-validate seed/generated datasets                           |
| `npm run generate:seed` | Regenerate `data/league-snapshot.json` from curated seed          |
| `npm run build`         | Production static build into `dist/`                              |
| `npm run ci`            | Format check, lint, typecheck, data validation, build, then tests |

## Continuous integration

GitHub Actions workflow `.github/workflows/ci.yml` runs on pull requests and pushes to `main`/`master`. Steps mirror local commands: `npm ci`, then format check, lint, typecheck, `validate:data`, test, and build — so invalid seed data fails before the site build is accepted.

## Product docs

Read in precedence order starting with `00_PROJECT_MASTER.md`. Sprint work lives under `sprints/`.

## Data contracts

- Runtime schemas: `src/schemas/index.ts` (Zod).
- Shared TypeScript types: inferred with `z.infer` and re-exported from `src/types/index.ts`.
- Canonical franchise IDs: `src/data/teamIds.ts` (exactly 30).
- Published snapshot path: `data/league-snapshot.json` (created in ATT-003).

There is no separate JSON Schema codegen step in MVP. Generation scripts and the site import the same Zod modules so validation and types stay aligned.

## Notes

- No secrets or machine-specific paths belong in this repository.
- Official team logos are deferred pending an owner branding decision; use team-name typography.
- Tier D social sources are discovery-only and must not affect Tank Score.
