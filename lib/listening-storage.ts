import type { ListeningSession, Reflection } from "@/types";

const SESSIONS_KEY = "accelerando:listening-sessions";
const REFLECTIONS_KEY = "accelerando:reflections";
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

function saveSessions(sessions: ListeningSession[]): void {
  writeJson(SESSIONS_KEY, sessions);
}

function getReflections(): Reflection[] {
  return readJson<Reflection>(REFLECTIONS_KEY);
}

function saveReflections(reflections: Reflection[]): void {
  writeJson(REFLECTIONS_KEY, reflections);
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

export function getSessionsForPiece(pieceId: string): ListeningSession[] {
  return getSessions().filter((session) => session.pieceId === pieceId);
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
