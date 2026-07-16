# YunoBall integration decision (ATT-202)

Status: **Deferred live database coupling; optional sanitized artifact**  
Date: 2026-07-16  
Owner follow-up: choose production export path before private beta if YunoBall metrics become score inputs.

## Decision

Are They Tanking? **does not** query YunoBall (or any private database) from the static site or from the default public build.

Sprint 2 uses:

1. **Fixture / public core-stat adapters** for standings and form (ATT-201).
2. An **optional sanitized YunoBall export artifact** (`data/yunoball/export.json`) when present.
3. **Graceful skip** when that artifact is absent — curated/local builds still succeed.

Live CI database export remains available as a future option once credentials, licensing, and field coverage are confirmed.

## Options considered

| Approach | Pros | Cons / risks |
| --- | --- | --- |
| **A. Read-only CI export** (job connects to YunoBall, writes sanitized JSON into the build) | Freshest metrics; single pipeline | Secrets in CI; failure modes if DB/network is down; harder to reproduce locally without credentials |
| **B. Published sanitized artifact** (separate job publishes versioned JSON; site job only downloads/reads the file) | Clear trust boundary; reproducible; no DB creds in the site workflow | Extra publishing step; artifact freshness depends on that job |
| **C. Deferred integration** (document + optional local artifact; no live wiring) | Unblocks hosted alpha; zero credential surface; curated seed remains authoritative | YunoBall-derived fields stay empty until an artifact is supplied |

**Chosen for Sprint 2:** **C**, with the adapter for **B** implemented so a sanitized file can be dropped in without code changes. Option **A** is explicitly deferred.

## Security and failure tradeoffs

- **Credentials:** Never commit connection strings. Never read `.env` database URLs in Astro pages or client bundles. The YunoBall adapter accepts only a filesystem path to a pre-sanitized JSON file.
- **Built assets:** Public `dist/` contains league snapshot JSON only. Sanitized exports are not required to ship; if present in `data/`, they must contain no secrets, private URLs, or internal hostnames.
- **Failure:** Missing YunoBall artifact → skip enrichment, log a clear `yunoball:skipped` reason, continue. Corrupt artifact → fail the *optional* ingest step loudly; the curated snapshot path remains usable for local alpha.
- **Reproducibility:** For a fixed export file, normalization is deterministic (stable team ordering by canonical `teamId`).

## Field mapping and gaps

| YunoBall concept | Public / normalized use | Notes |
| --- | --- | --- |
| Team game stats (W/L, net rating) | Core-stat enrichment when present | Prefer ATT-201 core adapter when both exist; YunoBall fills gaps |
| Daily team metrics / flags | Optional enrichment blob | Not scored automatically in Sprint 2 |
| Schedule factors | Optional schedule context | Missing → `null` |
| Game odds / market expectations | `marketContext` only | Labeled as market context — **not** proof of competitive intent and **not** a Tank Score input |

Fields not yet covered by a sanitized export are treated as unavailable (`null` / omitted), never inferred as zero.

## Fallback behavior

```text
if data/yunoball/export.json exists and validates
  → write data/yunoball-enrichment.json (deterministic)
else
  → skip; curated league-snapshot / fixture core stats still build
```

Odds-derived values, when present, always carry:

`role: "market_context"` and an explicit disclaimer string in the schema.

## Follow-up for owner

Before relying on YunoBall in scoring (Sprint 3+), pick **A** or **B** as the production export path and confirm which metrics are license-safe for the public site.
