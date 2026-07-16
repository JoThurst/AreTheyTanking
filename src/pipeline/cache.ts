import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Cache raw provider payloads for reproducibility.
 * Cached files are opaque blobs keyed by source + as-of stamp.
 */

export interface RawCacheWriteResult {
  cachePath: string;
  bytes: number;
}

export function buildRawCachePath(
  cacheRoot: string,
  sourceName: string,
  retrievedAt: string,
): string {
  const safeSource = sourceName.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const safeStamp = retrievedAt.replace(/[:.]/g, "-");
  return path.join(cacheRoot, safeSource, `${safeStamp}.json`);
}

export async function writeRawCache(
  cacheRoot: string,
  sourceName: string,
  retrievedAt: string,
  payload: unknown,
): Promise<RawCacheWriteResult> {
  const cachePath = buildRawCachePath(cacheRoot, sourceName, retrievedAt);
  await mkdir(path.dirname(cachePath), { recursive: true });
  const body = `${JSON.stringify(payload, null, 2)}\n`;
  await writeFile(cachePath, body, "utf8");
  return { cachePath, bytes: Buffer.byteLength(body, "utf8") };
}

export async function readRawCache(cachePath: string): Promise<unknown> {
  const raw = await readFile(cachePath, "utf8");
  return JSON.parse(raw) as unknown;
}
