import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SCORE_BAND_TOKENS, STRENGTH_TOKEN } from "../src/styles/tokens";

describe("design tokens", () => {
  it("defines tokens for every score band plus distinct strength styling", () => {
    expect(SCORE_BAND_TOKENS).toHaveLength(5);
    expect(STRENGTH_TOKEN.label).toBe("Team strength");
    const css = readFileSync(path.join(process.cwd(), "src/styles/tokens.css"), "utf8");
    for (const band of SCORE_BAND_TOKENS) {
      expect(css).toContain(band.cssVar);
      expect(css).toContain(band.textOn);
    }
    expect(css).toContain(STRENGTH_TOKEN.cssVar);
    expect(css).toContain("--color-focus");
  });
});
