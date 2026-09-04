import {
  annotationCategorySchema,
} from "@/lib/schemas/annotation";
import { pieceSchema } from "@/lib/schemas/piece";
import type {
  Annotation,
  ListeningSession,
  Piece,
  Recommendation,
  Reflection,
} from "@/types";

export interface ReflectionRow {
  id: string;
  user_id: string;
  piece_id: string;
  text: string;
  created_at: string;
}

export interface RecommendationRow {
  id: string;
  user_id: string;
  from_piece_id: string;
  to_piece: unknown;
  reasoning: string;
  based_on: string[];
  created_at: string;
}

export interface ListeningSessionRow {
  id: string;
  user_id: string;
  piece_id: string;
  reflection_id: string | null;
  recommendation_id: string | null;
  listened_at: string;
}

export interface AnnotationRow {
  id: string;
  user_id: string;
  piece_id: string;
  timestamp_seconds: number;
  label: string;
  note: string;
  category: string;
}

function fallbackPiece(pieceId: string, raw: unknown): Piece {
  const record =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    id: typeof record.id === "string" && record.id ? record.id : pieceId,
    title:
      typeof record.title === "string" && record.title
        ? record.title
        : "Unknown piece",
    composer:
      typeof record.composer === "string" && record.composer
        ? record.composer
        : "Unknown",
    movement:
      typeof record.movement === "string" ? record.movement : undefined,
    era: typeof record.era === "string" && record.era ? record.era : "Unknown",
    youtubeVideoId:
      typeof record.youtubeVideoId === "string" && record.youtubeVideoId
        ? record.youtubeVideoId
        : "unavailable",
    youtubeTitle:
      typeof record.youtubeTitle === "string" ? record.youtubeTitle : undefined,
    startOffsetSeconds:
      typeof record.startOffsetSeconds === "number" &&
      Number.isFinite(record.startOffsetSeconds)
        ? Math.max(0, Math.round(record.startOffsetSeconds))
        : 0,
    durationSeconds:
      typeof record.durationSeconds === "number" &&
      Number.isFinite(record.durationSeconds) &&
      record.durationSeconds > 0
        ? Math.round(record.durationSeconds)
        : 1,
    openOpusWorkId:
      typeof record.openOpusWorkId === "string"
        ? record.openOpusWorkId
        : undefined,
  };
}

export function rowToSession(row: ListeningSessionRow): ListeningSession {
  return {
    id: row.id,
    pieceId: row.piece_id,
    reflectionId: row.reflection_id ?? undefined,
    recommendationId: row.recommendation_id ?? undefined,
    listenedAt: row.listened_at,
  };
}

export function rowToReflection(row: ReflectionRow): Reflection {
  return {
    id: row.id,
    pieceId: row.piece_id,
    text: row.text,
    createdAt: row.created_at,
  };
}

export function rowToRecommendation(row: RecommendationRow): Recommendation {
  const parsed = pieceSchema.safeParse(row.to_piece);
  const toPiece = parsed.success
    ? parsed.data
    : fallbackPiece(row.from_piece_id, row.to_piece);

  return {
    id: row.id,
    fromPieceId: row.from_piece_id,
    toPiece,
    reasoning: row.reasoning,
    basedOn: row.based_on,
    createdAt: row.created_at,
  };
}

export function rowToAnnotation(row: AnnotationRow): Annotation {
  const category = annotationCategorySchema.safeParse(row.category);

  return {
    id: row.id,
    pieceId: row.piece_id,
    timestampSeconds: Number(row.timestamp_seconds),
    label: row.label,
    note: row.note,
    category: category.success ? category.data : "other",
  };
}
