import type {
  Annotation,
  ListeningSession,
  Recommendation,
  Reflection,
  SessionWithDetails,
} from "@/types";

export interface ListeningStorage {
  getAllSessions(): Promise<ListeningSession[]>;
  getSessionHistory(): Promise<SessionWithDetails[]>;
  getInProgressSession(): Promise<ListeningSession | null>;
  getRecentRecommendations(limit?: number): Promise<Recommendation[]>;
  getOrCreateCurrentSession(pieceId: string): Promise<ListeningSession>;
  getReflectionForSession(sessionId: string): Promise<Reflection | null>;
  saveReflectionForSession(
    sessionId: string,
    reflection: Reflection,
  ): Promise<void>;
  saveRecommendationForSession(
    sessionId: string,
    recommendation: Recommendation,
  ): Promise<void>;
  beginListeningToPiece(pieceId: string): void;
  getCachedAnnotations(pieceId: string): Promise<Annotation[] | null>;
  setCachedAnnotations(
    pieceId: string,
    annotations: Annotation[],
  ): Promise<void>;
  clearCachedAnnotations(pieceId: string): Promise<void>;
}
