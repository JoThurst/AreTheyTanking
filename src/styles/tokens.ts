/**
 * Design token metadata for tests and non-CSS consumers.
 * Visual source of truth for the browser is `src/styles/tokens.css`.
 */
export const SCORE_BAND_TOKENS = [
  { label: "Full Competition", cssVar: "--band-full", textOn: "--band-full-fg" },
  { label: "Competitive", cssVar: "--band-competitive", textOn: "--band-competitive-fg" },
  { label: "Direction Unclear", cssVar: "--band-unclear", textOn: "--band-unclear-fg" },
  { label: "Tank Watch", cssVar: "--band-watch", textOn: "--band-watch-fg" },
  { label: "Strong Tank Signal", cssVar: "--band-strong", textOn: "--band-strong-fg" },
] as const;

export const STRENGTH_TOKEN = {
  label: "Team strength",
  cssVar: "--strength",
  textOn: "--strength-fg",
} as const;
