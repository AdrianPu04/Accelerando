import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import { isUuid } from "@/lib/storage/ids";
import type {
  Annotation,
  ListeningSession,
  Recommendation,
  Reflection,
} from "@/types";

const MIGRATED_KEY = "accelerando:supabase-migrated";
const SESSIONS_KEY = "accelerando:listening-sessions";
const REFLECTIONS_KEY = "accelerando:reflections";
const RECOMMENDATIONS_KEY = "accelerando:recommendations";
const ANNOTATIONS_PREFIX = "accelerando:annotations:";

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

function readLegacyAnnotations(): { pieceId: string; annotations: Annotation[] }[] {
  if (typeof window === "undefined") {
    return [];
  }

  const results: { pieceId: string; annotations: Annotation[] }[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(ANNOTATIONS_PREFIX)) {
      continue;
    }

    const pieceId = key.slice(ANNOTATIONS_PREFIX.length);
    const annotations = readJson<Annotation>(key);
    if (annotations.length > 0) {
      results.push({ pieceId, annotations });
    }
  }

  return results;
}

function normalizeLegacyRecommendationIds(
  recommendations: Recommendation[],
  sessions: ListeningSession[],
): {
  recommendations: Recommendation[];
  sessions: ListeningSession[];
} {
  const idMap = new Map<string, string>();

  const normalizedRecommendations = recommendations.map((recommendation) => {
    if (isUuid(recommendation.id)) {
      return recommendation;
    }

    const newId = crypto.randomUUID();
    idMap.set(recommendation.id, newId);
    return { ...recommendation, id: newId };
  });

  const normalizedSessions = sessions.map((session) => {
    if (!session.recommendationId) {
      return session;
    }

    if (isUuid(session.recommendationId)) {
      return session;
    }

    const mappedId = idMap.get(session.recommendationId);
    if (mappedId) {
      return { ...session, recommendationId: mappedId };
    }

    return { ...session, recommendationId: undefined };
  });

  return {
    recommendations: normalizedRecommendations,
    sessions: normalizedSessions,
  };
}

function isDuplicateKeyError(error: PostgrestError): boolean {
  return error.code === "23505";
}

async function insertRows(
  supabase: SupabaseClient,
  table: "reflections" | "recommendations" | "listening_sessions",
  rows: Record<string, unknown>[],
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from(table).insert(rows);

  if (error && !isDuplicateKeyError(error)) {
    throw error;
  }
}

function markMigrationComplete(
  userId: string,
  annotationSets: { pieceId: string }[],
): void {
  localStorage.setItem(MIGRATED_KEY, userId);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(REFLECTIONS_KEY);
  localStorage.removeItem(RECOMMENDATIONS_KEY);

  for (const { pieceId } of annotationSets) {
    localStorage.removeItem(`${ANNOTATIONS_PREFIX}${pieceId}`);
  }
}

export async function migrateLocalStorageToSupabase(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (localStorage.getItem(MIGRATED_KEY)) {
    return;
  }

  const sessions = readJson<ListeningSession>(SESSIONS_KEY);
  const reflections = readJson<Reflection>(REFLECTIONS_KEY);
  const recommendations = readJson<Recommendation>(RECOMMENDATIONS_KEY);
  const annotationSets = readLegacyAnnotations();
  const { recommendations: normalizedRecommendations, sessions: normalizedSessions } =
    normalizeLegacyRecommendationIds(recommendations, sessions);

  const hasLocalData =
    normalizedSessions.length > 0 ||
    reflections.length > 0 ||
    normalizedRecommendations.length > 0 ||
    annotationSets.length > 0;

  if (!hasLocalData) {
    localStorage.setItem(MIGRATED_KEY, userId);
    return;
  }

  const { count: existingSessionCount, error: countError } = await supabase
    .from("listening_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw countError;
  }

  if ((existingSessionCount ?? 0) > 0) {
    markMigrationComplete(userId, annotationSets);
    return;
  }

  await insertRows(
    supabase,
    "reflections",
    reflections.map((reflection) => ({
      id: reflection.id,
      user_id: userId,
      piece_id: reflection.pieceId,
      text: reflection.text,
      created_at: reflection.createdAt,
    })),
  );

  await insertRows(
    supabase,
    "recommendations",
    normalizedRecommendations.map((recommendation) => ({
      id: recommendation.id,
      user_id: userId,
      from_piece_id: recommendation.fromPieceId,
      to_piece: recommendation.toPiece,
      reasoning: recommendation.reasoning,
      based_on: recommendation.basedOn,
      created_at: recommendation.createdAt,
    })),
  );

  await insertRows(
    supabase,
    "listening_sessions",
    normalizedSessions.map((session) => ({
      id: session.id,
      user_id: userId,
      piece_id: session.pieceId,
      reflection_id: session.reflectionId ?? null,
      recommendation_id: session.recommendationId ?? null,
      listened_at: session.listenedAt,
    })),
  );

  for (const { pieceId, annotations } of annotationSets) {
    const { error: deleteError } = await supabase
      .from("annotations")
      .delete()
      .eq("user_id", userId)
      .eq("piece_id", pieceId);

    if (deleteError) {
      throw deleteError;
    }

    if (annotations.length === 0) {
      continue;
    }

    const { error: insertError } = await supabase.from("annotations").insert(
      annotations.map((annotation) => ({
        id: isUuid(annotation.id) ? annotation.id : crypto.randomUUID(),
        user_id: userId,
        piece_id: pieceId,
        timestamp_seconds: annotation.timestampSeconds,
        label: annotation.label,
        note: annotation.note,
        category: annotation.category,
      })),
    );

    if (insertError && !isDuplicateKeyError(insertError)) {
      throw insertError;
    }
  }

  markMigrationComplete(userId, annotationSets);
}
