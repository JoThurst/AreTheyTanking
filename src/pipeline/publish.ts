import { access, copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { LeagueSnapshotSchema, type LeagueSnapshot } from "../schemas";
import { stableStringify } from "./generatePublicSnapshot";
import {
  PipelineStatusSchema,
  sanitizeFailureMessage,
  type PipelineFailure,
  type PipelineStatus,
} from "./pipelineStatus";

export interface PublishPaths {
  publicSnapshot: string;
  stagingSnapshot: string;
  pipelineStatus: string;
  manifest?: string;
  stagingManifest?: string;
}

export interface PublishSuccessInput {
  snapshot: LeagueSnapshot;
  serializedSnapshot: string;
  serializedManifest?: string;
  attemptedAt: string;
  paths: PublishPaths;
}

export interface PublishFailureInput {
  attemptedAt: string;
  failure: PipelineFailure;
  paths: PublishPaths;
  /** Prior successful update time if known; otherwise read from existing status/snapshot. */
  lastSuccessfulUpdateAt?: string;
}

export type PublishResult =
  | { ok: true; status: PipelineStatus }
  | { ok: false; status: PipelineStatus; publicDataReplaced: false };

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readExistingLastSuccess(paths: PublishPaths): Promise<string | null> {
  if (await exists(paths.pipelineStatus)) {
    const raw = JSON.parse(await readFile(paths.pipelineStatus, "utf8")) as unknown;
    const parsed = PipelineStatusSchema.safeParse(raw);
    if (parsed.success) return parsed.data.lastSuccessfulUpdateAt;
  }
  if (await exists(paths.publicSnapshot)) {
    const raw = JSON.parse(await readFile(paths.publicSnapshot, "utf8")) as unknown;
    const parsed = LeagueSnapshotSchema.safeParse(raw);
    if (parsed.success) return parsed.data.meta.lastSuccessfulUpdateAt;
  }
  return null;
}

async function writeStatus(filePath: string, status: PipelineStatus): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const parsed = PipelineStatusSchema.safeParse(status);
  if (!parsed.success) {
    throw new Error(`Invalid pipeline status: ${JSON.stringify(parsed.error.issues)}`);
  }
  await writeFile(filePath, stableStringify(parsed.data), "utf8");
}

/**
 * Publish a validated snapshot using staging + rename so failures never replace public data.
 */
export async function publishLastKnownGood(input: PublishSuccessInput): Promise<PublishResult> {
  const validated = LeagueSnapshotSchema.safeParse(input.snapshot);
  if (!validated.success) {
    return recordPublishFailure({
      attemptedAt: input.attemptedAt,
      paths: input.paths,
      failure: {
        source: "publish",
        step: "validate",
        message: sanitizeFailureMessage(
          `Candidate snapshot failed validation: ${JSON.stringify(validated.error.issues)}`,
        ),
      },
    });
  }

  await mkdir(path.dirname(input.paths.stagingSnapshot), { recursive: true });
  await writeFile(input.paths.stagingSnapshot, input.serializedSnapshot, "utf8");

  // Re-read staging and validate on disk before replacing public output.
  const stagedRaw = JSON.parse(await readFile(input.paths.stagingSnapshot, "utf8")) as unknown;
  const staged = LeagueSnapshotSchema.safeParse(stagedRaw);
  if (!staged.success) {
    return recordPublishFailure({
      attemptedAt: input.attemptedAt,
      paths: input.paths,
      failure: {
        source: "publish",
        step: "validate",
        message: sanitizeFailureMessage(
          `Staged snapshot failed validation: ${JSON.stringify(staged.error.issues)}`,
        ),
      },
    });
  }

  await mkdir(path.dirname(input.paths.publicSnapshot), { recursive: true });
  // Prefer atomic replace via rename; fall back to copy+rename pattern on Windows locks.
  try {
    await rename(input.paths.stagingSnapshot, input.paths.publicSnapshot);
  } catch {
    await copyFile(input.paths.stagingSnapshot, input.paths.publicSnapshot);
  }

  if (input.serializedManifest && input.paths.manifest) {
    const stagingManifest = input.paths.stagingManifest ?? `${input.paths.manifest}.staging.json`;
    await writeFile(stagingManifest, input.serializedManifest, "utf8");
    try {
      await rename(stagingManifest, input.paths.manifest);
    } catch {
      await copyFile(stagingManifest, input.paths.manifest);
    }
  }

  const status: PipelineStatus = {
    status: "ok",
    stale: false,
    lastSuccessfulUpdateAt: validated.data.meta.lastSuccessfulUpdateAt,
    lastAttemptAt: input.attemptedAt,
    failure: null,
  };
  await writeStatus(input.paths.pipelineStatus, status);
  return { ok: true, status };
}

/**
 * Record a failed pipeline attempt without replacing the public snapshot.
 */
export async function recordPublishFailure(input: PublishFailureInput): Promise<PublishResult> {
  const lastSuccessfulUpdateAt =
    input.lastSuccessfulUpdateAt ??
    (await readExistingLastSuccess(input.paths)) ??
    input.attemptedAt;

  const status: PipelineStatus = {
    status: "failed",
    stale: true,
    lastSuccessfulUpdateAt,
    lastAttemptAt: input.attemptedAt,
    failure: {
      source: input.failure.source,
      step: input.failure.step,
      message: sanitizeFailureMessage(input.failure.message),
    },
  };
  await writeStatus(input.paths.pipelineStatus, status);
  return { ok: false, status, publicDataReplaced: false };
}

export async function readPipelineStatus(filePath: string): Promise<PipelineStatus | null> {
  if (!(await exists(filePath))) return null;
  const raw = JSON.parse(await readFile(filePath, "utf8")) as unknown;
  const parsed = PipelineStatusSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
