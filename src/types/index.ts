/**
 * Schema / type parity
 *
 * Canonical runtime schemas live in `src/schemas/index.ts` (Zod).
 * TypeScript types are inferred from those schemas via `z.infer` and re-exported
 * from `src/types/index.ts` for render-time use.
 *
 * There is no separate JSON Schema generation step in MVP. Generation scripts and
 * the Astro site share the same Zod modules so validation and types cannot drift.
 *
 * Franchise IDs: exactly one list in `src/data/teamIds.ts`.
 */
export * from "../schemas/index";
export { TEAM_IDS, isTeamId, type TeamId } from "../data/teamIds";
