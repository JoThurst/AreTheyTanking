# Pipeline runbook — freshness and recovery

Owner: project owner (manual editorial refresh)  
Automation: GitHub Actions `Data pipeline and deploy`  
Last updated: 2026-07-16

## What “fresh” means

| Signal | Where | Meaning |
| --- | --- | --- |
| `meta.lastSuccessfulUpdateAt` | `data/league-snapshot.json` | Last time a validated public snapshot was published |
| `meta.stale` / pipeline overlay | snapshot + `data/pipeline-status.json` | Site should show the stale banner |
| `pipeline-status.status` | `data/pipeline-status.json` | `ok` or `failed` for the latest attempt |
| `generation-manifest.inputs.*.asOf` | `data/generation-manifest.json` | Source as-of times for core stats |

The public site shows **stale + last successful update** only. It does **not** show workflow names, runner hosts, secret names, or failure stack traces.

## Ownership

| Work | Owner |
| --- | --- |
| Competitive state, summaries, evidence, overrides, pick notes | **Project owner** via `data/editorial-snapshot.json` (edit curated content; do not hand-edit generated public facts) |
| Automated record / recent form refresh | Scheduled pipeline (`ingest:core` → `generate:public`) |
| Optional YunoBall enrichment | Owner drops sanitized `data/yunoball/export.json` when available; otherwise skipped |
| Deploy / Pages enablement | Owner (GitHub repo Settings → Pages → GitHub Actions) |

After editorial edits: run `npm run generate:public` (or the pipeline workflow) so public output picks up protected fields without losing last-known-good behavior.

## Normal scheduled run

1. Workflow `.github/workflows/pipeline-deploy.yml` runs daily (`cron: 0 12 * * *` UTC) or on schedule.
2. Steps: `ingest:core` → `ingest:yunoball` → `generate:public` → `validate:data` → `build` → commit public data → deploy Pages.
3. Logs should include source freshness (`asOf`, `retrievedAt`) and team-count summaries (see scripts).
4. On success, `pipeline-status.json` is `status: ok`, `stale: false`.

## Manual rerun

1. GitHub → Actions → **Data pipeline and deploy** → **Run workflow**.
2. Or locally: `npm run pipeline`.
3. Confirm Actions log lines for team counts and as-of timestamps.
4. Open the hosted site and check card/update timestamps match `lastSuccessfulUpdateAt`.

## Source failure

Symptoms: ingest or generate exits non-zero; `pipeline-status.status` becomes `failed`, `stale: true`.

Actions:

1. Read `data/pipeline-status.json` → `failure.source` and `failure.step` (sanitized message).
2. Do **not** manually replace `data/league-snapshot.json` with partial data.
3. Fix the source fixture/export, then rerun the workflow.
4. Prior valid public snapshot remains deployed until a successful publish.

## Invalid data

Symptoms: Zod validation fails during generate or `validate:data`.

Actions:

1. Inspect the validation issues in the Actions log.
2. Confirm editorial base still validates: `npm run validate:data`.
3. Public file is unchanged (last-known-good). Site shows stale if status overlay says so.
4. Fix the bad input; rerun.

## Rollback to last-known-good

The default failure path **already** keeps the previous public snapshot.

If a bad snapshot was successfully published:

1. Restore prior `data/league-snapshot.json` (and matching `generation-manifest.json` / `pipeline-status.json`) from git history.
2. Redeploy: `npm run build` and rerun the deploy job, or `workflow_dispatch` after the restore commit.
3. Optionally set `pipeline-status` to `ok` with the restored `lastSuccessfulUpdateAt` after validate succeeds.

Never deploy `dist/` built from a failed generate.

## Diagnosing without reconstructing the pipeline

Minimum files to collect:

1. `data/pipeline-status.json`
2. `data/generation-manifest.json`
3. Actions run URL (operators only — not shown on the site)

Team-count and freshness summaries also appear in script stdout (`ingest:core`, `generate:public`, pipeline confirm step).
