export interface Piece {
  id: string;
  title: string;
  composer: string;
  movement?: string;
  era: string;
  youtubeVideoId: string;
  /** Seconds into the YouTube video where this piece/movement begins. */
  startOffsetSeconds: number;
  durationSeconds: number;
}

export type AnnotationCategory =
  | "theme"
  | "structure"
  | "orchestration"
  | "harmony"
  | "dynamics"
  | "other";

export interface Annotation {
  id: string;
  pieceId: string;
  timestampSeconds: number;
  label: string;
  note: string;
  category: AnnotationCategory;
}

export interface Reflection {
  id: string;
  pieceId: string;
  text: string;
  createdAt: string;
}

export interface ListeningSession {
  id: string;
  pieceId: string;
  reflectionId?: string;
  recommendationId?: string;
  listenedAt: string;
}

export interface Recommendation {
  id: string;
  fromPieceId: string;
  toPiece: Piece;
  reasoning: string;
  basedOn: string[];
  createdAt: string;
}
