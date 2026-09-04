import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  generateAnnotationsResponseSchema,
  type GeneratedAnnotation,
} from "@/lib/schemas/annotation";
import type { Piece } from "@/types";

const CACHE_DIR = path.join(process.cwd(), "data", "annotation-cache");

function cacheKeyForPiece(piece: Piece): string {
  const fingerprint = [
    piece.id,
    piece.youtubeVideoId,
    String(piece.startOffsetSeconds),
    String(piece.durationSeconds),
    piece.youtubeTitle ?? "",
  ].join("|");

  return createHash("sha256").update(fingerprint).digest("hex").slice(0, 32);
}

function cachePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

export async function readSharedAnnotationCache(
  piece: Piece,
): Promise<GeneratedAnnotation[] | null> {
  try {
    const raw = await readFile(cachePath(cacheKeyForPiece(piece)), "utf8");
    const parsed = generateAnnotationsResponseSchema.parse(JSON.parse(raw));
    return parsed.annotations;
  } catch {
    return null;
  }
}

export async function writeSharedAnnotationCache(
  piece: Piece,
  annotations: GeneratedAnnotation[],
): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(
    cachePath(cacheKeyForPiece(piece)),
    JSON.stringify({ annotations }, null, 2),
    "utf8",
  );
}
