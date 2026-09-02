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
  to_piece: Piece;
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
  return {
    id: row.id,
    fromPieceId: row.from_piece_id,
    toPiece: row.to_piece,
    reasoning: row.reasoning,
    basedOn: row.based_on,
    createdAt: row.created_at,
  };
}

export function rowToAnnotation(row: AnnotationRow): Annotation {
  return {
    id: row.id,
    pieceId: row.piece_id,
    timestampSeconds: Number(row.timestamp_seconds),
    label: row.label,
    note: row.note,
    category: row.category as Annotation["category"],
  };
}
