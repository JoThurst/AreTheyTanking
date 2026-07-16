import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("accessibility smoke artifacts", () => {
  it("homepage exposes skip link, methodology link, and non-color score labels", () => {
    const html = readFileSync(path.join(process.cwd(), "dist/index.html"), "utf8");
    expect(html).toContain('href="#main"');
    expect(html).toContain("Skip to content");
    expect(html).toContain("/methodology");
    expect(html).toContain("Tank Score");
    expect(html).toContain("Team strength");
    expect(html).toContain("Confidence");
    expect(html).toContain('lang="en"');
  });

  it("methodology page publishes bands, tiers, and injury guardrails", () => {
    const html = readFileSync(path.join(process.cwd(), "dist/methodology/index.html"), "utf8");
    expect(html).toContain("Score bands");
    expect(html).toContain("Evidence tiers");
    expect(html).toContain("discovery only");
    expect(html).toContain("Injury");
    expect(html).toContain("not affiliated");
  });

  it("team page keeps unknown intent visible and links methodology", () => {
    const html = readFileSync(path.join(process.cwd(), "dist/team/utah-jazz/index.html"), "utf8");
    expect(html).toContain("unknown");
    expect(html).toContain("/methodology");
    expect(html).toContain("Offseason mode");
    expect(html).toContain("Verification date");
  });
});
