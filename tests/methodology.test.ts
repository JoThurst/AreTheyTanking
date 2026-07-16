import { describe, expect, it } from "vitest";
import { METHODOLOGY, EVIDENCE_TIERS, METHODOLOGY_VERSION } from "../content/methodology";

describe("methodology content", () => {
  it("exposes a score version to the rendering layer", () => {
    expect(METHODOLOGY_VERSION).toBe("0.1.0");
    expect(METHODOLOGY.version).toBe(METHODOLOGY_VERSION);
  });

  it("makes Tier D discovery-only", () => {
    const tierD = EVIDENCE_TIERS.find((t) => t.tier === "D");
    expect(tierD?.canAffectScore).toBe(false);
    expect(METHODOLOGY.socialSourceRules.join(" ")).toMatch(/cannot change Tank Score/i);
  });

  it("prominently states bad-is-not-tanking and injury limits", () => {
    expect(METHODOLOGY.tagline.toLowerCase()).toContain("bad is not");
    expect(METHODOLOGY.principles[0]?.title.toLowerCase()).toContain("bad is not tanking");
    expect(METHODOLOGY.injuryGuardrails.length).toBeGreaterThan(0);
    expect(METHODOLOGY.falsePositiveGuardrails.join(" ")).toMatch(/injury/i);
  });

  it("covers FR-201 through FR-205 fields", () => {
    expect(METHODOLOGY.formula.tankScore.length).toBeGreaterThan(0);
    expect(METHODOLOGY.scoreBands).toHaveLength(5);
    expect(METHODOLOGY.evidenceTiers).toHaveLength(4);
    expect(METHODOLOGY.changelog.length).toBeGreaterThan(0);
    expect(METHODOLOGY.corrections.contactPlaceholder.length).toBeGreaterThan(0);
    expect(METHODOLOGY.nonAffiliation).toMatch(/not affiliated/i);
  });
});
