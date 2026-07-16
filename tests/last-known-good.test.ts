import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { LeagueSnapshotSchema } from "../src/schemas";
import { buildMinimalSnapshot, sampleTeam } from "./fixtures/schemaFixtures";
import { TEAM_IDS } from "../src/data/teamIds";
import { stableStringify } from "../src/pipeline/generatePublicSnapshot";
import { publishLastKnownGood, recordPublishFailure } from "../src/pipeline/publish";
import { sanitizeFailureMessage } from "../src/pipeline/pipelineStatus";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

function fullSnapshot() {
  const base = buildMinimalSnapshot();
  return LeagueSnapshotSchema.parse({
    ...base,
    teams: TEAM_IDS.map((teamId) => ({
      ...sampleTeam,
      teamId,
      identity: {
        ...sampleTeam.identity,
        teamId,
        abbreviation: teamId,
        slug: `${teamId.toLowerCase()}-team`,
        name: `${teamId} Team`,
        city: teamId,
      },
    })),
  });
}

describe("sanitizeFailureMessage", () => {
  it("redacts connection strings and secret assignments", () => {
    const raw =
      "Failed postgres://user:pass@host/db DATABASE_URL=secretvalue API_KEY=abcd TOKEN=xyz";
    const cleaned = sanitizeFailureMessage(raw);
    expect(cleaned).toContain("[redacted-connection]");
    expect(cleaned).toContain("DATABASE_URL=[redacted]");
    expect(cleaned).not.toContain("user:pass");
    expect(cleaned).not.toContain("secretvalue");
  });
});

describe("last-known-good publication", () => {
  it("does not replace public data when validation fails", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "att-lkg-"));
    tempDirs.push(root);
    const paths = {
      publicSnapshot: path.join(root, "league-snapshot.json"),
      stagingSnapshot: path.join(root, "staging", "league-snapshot.json"),
      pipelineStatus: path.join(root, "pipeline-status.json"),
    };

    const good = fullSnapshot();
    const goodBody = stableStringify(good);
    await writeFile(paths.publicSnapshot, goodBody, "utf8");

    const before = await readFile(paths.publicSnapshot, "utf8");
    const badSnapshot = {
      ...good,
      teams: good.teams.slice(0, 2),
    };

    const result = await publishLastKnownGood({
      snapshot: badSnapshot as typeof good,
      serializedSnapshot: stableStringify(badSnapshot),
      attemptedAt: "2026-07-16T20:00:00.000Z",
      paths,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.publicDataReplaced).toBe(false);
      expect(result.status.stale).toBe(true);
      expect(result.status.failure?.step).toBe("validate");
      expect(result.status.failure?.source).toBe("publish");
    }

    const after = await readFile(paths.publicSnapshot, "utf8");
    expect(after).toBe(before);
  });

  it("records retrieval failures without touching public data", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "att-lkg-"));
    tempDirs.push(root);
    await mkdir(path.join(root, "staging"), { recursive: true });
    const paths = {
      publicSnapshot: path.join(root, "league-snapshot.json"),
      stagingSnapshot: path.join(root, "staging", "league-snapshot.json"),
      pipelineStatus: path.join(root, "pipeline-status.json"),
    };

    const good = fullSnapshot();
    await writeFile(paths.publicSnapshot, stableStringify(good), "utf8");
    const before = await readFile(paths.publicSnapshot, "utf8");

    const result = await recordPublishFailure({
      attemptedAt: "2026-07-16T20:05:00.000Z",
      paths,
      lastSuccessfulUpdateAt: good.meta.lastSuccessfulUpdateAt,
      failure: {
        source: "fixture-core-stats",
        step: "retrieve",
        message: "upstream timeout contacting provider",
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected publish failure");
    }
    expect(result.publicDataReplaced).toBe(false);
    expect(result.status.stale).toBe(true);
    expect(result.status.lastSuccessfulUpdateAt).toBe(good.meta.lastSuccessfulUpdateAt);
    expect(result.status.failure?.source).toBe("fixture-core-stats");
    expect(result.status.failure?.step).toBe("retrieve");
    expect(await readFile(paths.publicSnapshot, "utf8")).toBe(before);
  });

  it("publishes on success and clears stale failure state", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "att-lkg-"));
    tempDirs.push(root);
    const paths = {
      publicSnapshot: path.join(root, "league-snapshot.json"),
      stagingSnapshot: path.join(root, "staging", "league-snapshot.json"),
      pipelineStatus: path.join(root, "pipeline-status.json"),
      manifest: path.join(root, "generation-manifest.json"),
      stagingManifest: path.join(root, "staging", "generation-manifest.json"),
    };

    const snapshot = fullSnapshot();
    const result = await publishLastKnownGood({
      snapshot,
      serializedSnapshot: stableStringify(snapshot),
      serializedManifest: stableStringify({ ok: true }),
      attemptedAt: "2026-07-16T20:10:00.000Z",
      paths,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.status.stale).toBe(false);
      expect(result.status.failure).toBeNull();
    }
    const written = LeagueSnapshotSchema.parse(
      JSON.parse(await readFile(paths.publicSnapshot, "utf8")) as unknown,
    );
    expect(written.teams).toHaveLength(30);
  });
});
