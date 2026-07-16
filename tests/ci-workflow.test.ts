import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("CI workflow", () => {
  it("runs the same local gate commands on PRs and primary branches", () => {
    const workflow = readFileSync(path.join(process.cwd(), ".github/workflows/ci.yml"), "utf8");
    expect(workflow).toContain("pull_request");
    expect(workflow).toContain("branches: [main, master]");
    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("npm run format:check");
    expect(workflow).toContain("npm run lint");
    expect(workflow).toContain("npm run typecheck");
    expect(workflow).toContain("npm run validate:data");
    expect(workflow).toContain("npm run test");
    expect(workflow).toContain("npm run build");

    const validateIdx = workflow.indexOf("npm run validate:data");
    const buildIdx = workflow.indexOf("npm run build");
    const testIdx = workflow.indexOf("npm run test");
    expect(validateIdx).toBeGreaterThan(-1);
    expect(buildIdx).toBeGreaterThan(validateIdx);
    expect(testIdx).toBeGreaterThan(buildIdx);
  });
});
