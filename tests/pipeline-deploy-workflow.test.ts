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

describe("pipeline deploy workflow", () => {
  const workflow = readFileSync(
    path.join(process.cwd(), ".github/workflows/pipeline-deploy.yml"),
    "utf8",
  );

  it("supports scheduled and manual runs with concurrency protection", () => {
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("concurrency:");
    expect(workflow).toContain("cancel-in-progress: true");
    expect(workflow).toContain("are-they-tanking-pipeline-deploy");
  });

  it("deploys only after ingest, generate, validate, and build", () => {
    const ingestIdx = workflow.indexOf("npm run ingest:core");
    const generateIdx = workflow.indexOf("npm run generate:public");
    const validateIdx = workflow.indexOf("npm run validate:data");
    const buildIdx = workflow.indexOf("npm run build");
    const deployIdx = workflow.indexOf("actions/deploy-pages@v4");

    expect(ingestIdx).toBeGreaterThan(-1);
    expect(generateIdx).toBeGreaterThan(ingestIdx);
    expect(validateIdx).toBeGreaterThan(generateIdx);
    expect(buildIdx).toBeGreaterThan(validateIdx);
    expect(deployIdx).toBeGreaterThan(buildIdx);
  });

  it("references secrets only through GitHub protected configuration", () => {
    expect(workflow).toContain("secrets.GITHUB_TOKEN");
    expect(workflow).not.toMatch(/password\s*[:=]\s*['\"][^'\"]+['\"]/i);
    expect(workflow).not.toMatch(/postgres:\/\//i);
    expect(workflow).toContain("Future YunoBall DB credentials");
  });
});
