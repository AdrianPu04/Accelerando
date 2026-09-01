import type {
  ListeningSession,
  Piece,
  Recommendation,
  Reflection,
  SessionWithDetails,
} from "@/types";
import { getPieceById } from "@/lib/pieces";

const SESSIONS_KEY = "accelerando:listening-sessions";
const REFLECTIONS_KEY = "accelerando:reflections";
const RECOMMENDATIONS_KEY = "accelerando:recommendations";
const CURRENT_SESSION_PREFIX = "accelerando:current-session:";

function currentSessionKey(pieceId: string): string {
  return `${CURRENT_SESSION_PREFIX}${pieceId}`;
}

function readJson<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function getSessions(): ListeningSession[] {
  return readJson<ListeningSession>(SESSIONS_KEY);
}

export function getAllSessions(): ListeningSession[] {
  return getSessions();
}

export function getRecentRecommendations(limit = 5): Recommendation[] {
  return [...getRecommendations()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getInProgressSession(): ListeningSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  for (const session of getSessions()) {
    if (session.reflectionId) {
      continue;
    }

    const currentId = sessionStorage.getItem(currentSessionKey(session.pieceId));
    if (currentId === session.id) {
      return session;
    }
  }

  return (
    [...getSessions()]
      .filter((session) => !session.reflectionId)
      .sort((a, b) => b.listenedAt.localeCompare(a.listenedAt))[0] ?? null
  );
}

function saveSessions(sessions: ListeningSession[]): void {
  writeJson(SESSIONS_KEY, sessions);
}

function getReflections(): Reflection[] {
  return readJson<Reflection>(REFLECTIONS_KEY);
}

function saveReflections(reflections: Reflection[]): void {
  writeJson(REFLECTIONS_KEY, reflections);
}

function getRecommendations(): Recommendation[] {
  return readJson<Recommendation>(RECOMMENDATIONS_KEY);
}

function saveRecommendations(recommendations: Recommendation[]): void {
  writeJson(RECOMMENDATIONS_KEY, recommendations);
}

export function getSession(sessionId: string): ListeningSession | null {
  return getSessions().find((session) => session.id === sessionId) ?? null;
}

export function getReflection(reflectionId: string): Reflection | null {
  return getReflections().find((reflection) => reflection.id === reflectionId) ?? null;
}

export function getReflectionForSession(
  sessionId: string,
): Reflection | null {
  const session = getSession(sessionId);
  if (!session?.reflectionId) {
    return null;
  }

  return getReflection(session.reflectionId);
}

export function getRecommendation(
  recommendationId: string,
): Recommendation | null {
  return (
    getRecommendations().find(
      (recommendation) => recommendation.id === recommendationId,
    ) ?? null
  );
}

export function getRecommendationForSession(
  sessionId: string,
): Recommendation | null {
  const session = getSession(sessionId);
  if (!session?.recommendationId) {
    return null;
  }

  return getRecommendation(session.recommendationId);
}

export function clearCurrentSession(pieceId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(currentSessionKey(pieceId));
}

export function beginListeningToPiece(pieceId: string): void {
  clearCurrentSession(pieceId);
}

export function getSessionsForPiece(pieceId: string): ListeningSession[] {
  return getSessions().filter((session) => session.pieceId === pieceId);
}

function resolvePieceForSession(pieceId: string): Piece | null {
  const curated = getPieceById(pieceId);
  if (curated) {
    return curated;
  }

  for (const recommendation of getRecommendations()) {
    if (recommendation.toPiece.id === pieceId) {
      return recommendation.toPiece;
    }
  }

  return null;
}

export function getSessionHistory(): SessionWithDetails[] {
  const inProgress = getInProgressSession();

  return getSessions()
    .map((session) => ({
      session,
      piece: resolvePieceForSession(session.pieceId),
      reflection: session.reflectionId
        ? getReflection(session.reflectionId)
        : null,
      recommendation: session.recommendationId
        ? getRecommendation(session.recommendationId)
        : null,
      isInProgress: inProgress?.id === session.id,
    }))
    .sort((a, b) => b.session.listenedAt.localeCompare(a.session.listenedAt));
}

export function getOrCreateCurrentSession(pieceId: string): ListeningSession {
  if (typeof window === "undefined") {
    return {
      id: "",
      pieceId,
      listenedAt: new Date().toISOString(),
    };
  }

  const currentSessionId = sessionStorage.getItem(currentSessionKey(pieceId));

  if (currentSessionId) {
    const existing = getSession(currentSessionId);
    if (existing?.pieceId === pieceId && !existing.reflectionId) {
      return existing;
    }
  }

  const session: ListeningSession = {
    id: crypto.randomUUID(),
    pieceId,
    listenedAt: new Date().toISOString(),
  };

  saveSessions([...getSessions(), session]);
  sessionStorage.setItem(currentSessionKey(pieceId), session.id);
  return session;
}

export function saveReflectionForSession(
  sessionId: string,
  reflection: Reflection,
): void {
  const sessions = getSessions();
  const sessionIndex = sessions.findIndex((session) => session.id === sessionId);

  if (sessionIndex === -1) {
    return;
  }

  const existingReflectionIndex = getReflections().findIndex(
    (item) => item.id === reflection.id,
  );

  const reflections = getReflections();
  if (existingReflectionIndex === -1) {
    saveReflections([...reflections, reflection]);
  } else {
    const nextReflections = [...reflections];
    nextReflections[existingReflectionIndex] = reflection;
    saveReflections(nextReflections);
  }

  const nextSessions = [...sessions];
  nextSessions[sessionIndex] = {
    ...nextSessions[sessionIndex],
    reflectionId: reflection.id,
  };
  saveSessions(nextSessions);
}

export function saveRecommendationForSession(
  sessionId: string,
  recommendation: Recommendation,
): void {
  const sessions = getSessions();
  const sessionIndex = sessions.findIndex((session) => session.id === sessionId);

  if (sessionIndex === -1) {
    return;
  }

  const recommendations = getRecommendations();
  const existingIndex = recommendations.findIndex(
    (item) => item.id === recommendation.id,
  );

  if (existingIndex === -1) {
    saveRecommendations([...recommendations, recommendation]);
  } else {
    const nextRecommendations = [...recommendations];
    nextRecommendations[existingIndex] = recommendation;
    saveRecommendations(nextRecommendations);
  }

  const nextSessions = [...sessions];
  nextSessions[sessionIndex] = {
    ...nextSessions[sessionIndex],
    recommendationId: recommendation.id,
  };
  saveSessions(nextSessions);
}
