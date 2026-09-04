import "server-only";

import { createHash } from "node:crypto";

import {
  generateAnnotationsResponseSchema,
  type GeneratedAnnotation,
} from "@/lib/schemas/annotation";
import { createServiceClient } from "@/lib/supabase/server";
import type { Piece } from "@/types";

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

export async function readSharedAnnotationCache(
  piece: Piece,
): Promise<GeneratedAnnotation[] | null> {
  const supabase = createServiceClient();
  if (!supabase) {
    return null;
  }

  const cacheKey = cacheKeyForPiece(piece);
  const { data, error } = await supabase
    .from("shared_annotation_cache")
    .select("annotations")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error) {
    console.error("Annotation cache read failed:", error.message);
    return null;
  }

  if (!data?.annotations) {
    return null;
  }

  try {
    const parsed = generateAnnotationsResponseSchema.parse({
      annotations: data.annotations,
    });
    return parsed.annotations;
  } catch {
    return null;
  }
}

export async function writeSharedAnnotationCache(
  piece: Piece,
  annotations: GeneratedAnnotation[],
): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) {
    return;
  }

  const cacheKey = cacheKeyForPiece(piece);
  const { error } = await supabase.from("shared_annotation_cache").upsert({
    cache_key: cacheKey,
    piece_id: piece.id,
    annotations,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Annotation cache write failed: ${error.message}`);
  }
}
