import type { SupabaseClient } from "@supabase/supabase-js";

import { getPieceById } from "@/lib/pieces";
import {
  rowToAnnotation,
  rowToRecommendation,
  rowToReflection,
  rowToSession,
  type AnnotationRow,
  type ListeningSessionRow,
  type RecommendationRow,
  type ReflectionRow,
} from "@/lib/storage/rows";
import type { ListeningStorage } from "@/lib/storage/types";
import type {
  Annotation,
  ListeningSession,
  Piece,
  Recommendation,
  Reflection,
  SessionWithDetails,
} from "@/types";

const CURRENT_SESSION_PREFIX = "accelerando:current-session:";

function currentSessionKey(pieceId: string): string {
  return `${CURRENT_SESSION_PREFIX}${pieceId}`;
}

async function getUserId(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Not authenticated");
  }

  return user.id;
}

async function fetchSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<ListeningSessionRow[]> {
  const { data, error } = await supabase
    .from("listening_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("listened_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ListeningSessionRow[];
}

async function fetchReflections(
  supabase: SupabaseClient,
  userId: string,
): Promise<ReflectionRow[]> {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data ?? []) as ReflectionRow[];
}

async function fetchRecommendations(
  supabase: SupabaseClient,
  userId: string,
): Promise<RecommendationRow[]> {
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data ?? []) as RecommendationRow[];
}

function resolvePieceForSession(
  pieceId: string,
  recommendations: Recommendation[],
): Piece | null {
  const curated = getPieceById(pieceId);
  if (curated) {
    return curated;
  }

  for (const recommendation of recommendations) {
    if (recommendation.toPiece.id === pieceId) {
      return recommendation.toPiece;
    }
  }

  return null;
}

export function createSupabaseStorage(
  supabase: SupabaseClient,
): ListeningStorage {
  return {
    async getAllSessions() {
      const userId = await getUserId(supabase);
      const rows = await fetchSessions(supabase, userId);
      return rows.map(rowToSession);
    },

    async getInProgressSession() {
      if (typeof window === "undefined") {
        return null;
      }

      const userId = await getUserId(supabase);
      const sessions = (await fetchSessions(supabase, userId)).map(rowToSession);

      for (const session of sessions) {
        if (session.reflectionId) {
          continue;
        }

        const currentId = sessionStorage.getItem(
          currentSessionKey(session.pieceId),
        );
        if (currentId === session.id) {
          return session;
        }
      }

      return (
        sessions
          .filter((session) => !session.reflectionId)
          .sort((a, b) => b.listenedAt.localeCompare(a.listenedAt))[0] ?? null
      );
    },

    async getRecentRecommendations(limit = 5) {
      const userId = await getUserId(supabase);
      const rows = await fetchRecommendations(supabase, userId);
      return rows
        .map(rowToRecommendation)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
    },

    async getSessionHistory() {
      const userId = await getUserId(supabase);
      const [sessionRows, reflectionRows, recommendationRows] =
        await Promise.all([
          fetchSessions(supabase, userId),
          fetchReflections(supabase, userId),
          fetchRecommendations(supabase, userId),
        ]);

      const reflections = new Map(
        reflectionRows.map((row) => [row.id, rowToReflection(row)]),
      );
      const recommendations = new Map(
        recommendationRows.map((row) => [row.id, rowToRecommendation(row)]),
      );
      const recommendationList = [...recommendations.values()];
      const inProgress = await this.getInProgressSession();

      return sessionRows
        .map((row) => {
          const session = rowToSession(row);
          return {
            session,
            piece: resolvePieceForSession(session.pieceId, recommendationList),
            reflection: session.reflectionId
              ? (reflections.get(session.reflectionId) ?? null)
              : null,
            recommendation: session.recommendationId
              ? (recommendations.get(session.recommendationId) ?? null)
              : null,
            isInProgress: inProgress?.id === session.id,
          } satisfies SessionWithDetails;
        })
        .sort((a, b) =>
          b.session.listenedAt.localeCompare(a.session.listenedAt),
        );
    },

    async getOrCreateCurrentSession(pieceId: string) {
      if (typeof window === "undefined") {
        return {
          id: "",
          pieceId,
          listenedAt: new Date().toISOString(),
        };
      }

      const userId = await getUserId(supabase);
      const currentSessionId = sessionStorage.getItem(
        currentSessionKey(pieceId),
      );

      if (currentSessionId) {
        const { data, error } = await supabase
          .from("listening_sessions")
          .select("*")
          .eq("id", currentSessionId)
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        const existing = data as ListeningSessionRow | null;
        if (existing?.piece_id === pieceId && !existing.reflection_id) {
          return rowToSession(existing);
        }
      }

      const sessionRow = {
        id: crypto.randomUUID(),
        user_id: userId,
        piece_id: pieceId,
        listened_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("listening_sessions")
        .insert(sessionRow);

      if (error) {
        throw error;
      }

      sessionStorage.setItem(currentSessionKey(pieceId), sessionRow.id);
      return rowToSession(sessionRow as ListeningSessionRow);
    },

    async getReflectionForSession(sessionId: string) {
      const userId = await getUserId(supabase);
      const { data: session, error: sessionError } = await supabase
        .from("listening_sessions")
        .select("reflection_id")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.reflection_id) {
        return null;
      }

      const { data, error } = await supabase
        .from("reflections")
        .select("*")
        .eq("id", session.reflection_id)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? rowToReflection(data as ReflectionRow) : null;
    },

    async saveReflectionForSession(sessionId: string, reflection: Reflection) {
      const userId = await getUserId(supabase);

      const { error: reflectionError } = await supabase.from("reflections").upsert({
        id: reflection.id,
        user_id: userId,
        piece_id: reflection.pieceId,
        text: reflection.text,
        created_at: reflection.createdAt,
      });

      if (reflectionError) {
        throw reflectionError;
      }

      const { error: sessionError } = await supabase
        .from("listening_sessions")
        .update({ reflection_id: reflection.id })
        .eq("id", sessionId)
        .eq("user_id", userId);

      if (sessionError) {
        throw sessionError;
      }
    },

    async saveRecommendationForSession(
      sessionId: string,
      recommendation: Recommendation,
    ) {
      const userId = await getUserId(supabase);

      const { error: recommendationError } = await supabase
        .from("recommendations")
        .upsert({
          id: recommendation.id,
          user_id: userId,
          from_piece_id: recommendation.fromPieceId,
          to_piece: recommendation.toPiece,
          reasoning: recommendation.reasoning,
          based_on: recommendation.basedOn,
          created_at: recommendation.createdAt,
        });

      if (recommendationError) {
        throw recommendationError;
      }

      const { error: sessionError } = await supabase
        .from("listening_sessions")
        .update({ recommendation_id: recommendation.id })
        .eq("id", sessionId)
        .eq("user_id", userId);

      if (sessionError) {
        throw sessionError;
      }
    },

    beginListeningToPiece(pieceId: string) {
      if (typeof window === "undefined") {
        return;
      }

      sessionStorage.removeItem(currentSessionKey(pieceId));
    },

    async getCachedAnnotations(pieceId: string) {
      const userId = await getUserId(supabase);
      const { data, error } = await supabase
        .from("annotations")
        .select("*")
        .eq("user_id", userId)
        .eq("piece_id", pieceId)
        .order("timestamp_seconds", { ascending: true });

      if (error) {
        throw error;
      }

      const rows = (data ?? []) as AnnotationRow[];
      if (rows.length === 0) {
        return null;
      }

      return rows.map(rowToAnnotation);
    },

    async setCachedAnnotations(pieceId: string, annotations: Annotation[]) {
      const userId = await getUserId(supabase);

      const { error: deleteError } = await supabase
        .from("annotations")
        .delete()
        .eq("user_id", userId)
        .eq("piece_id", pieceId);

      if (deleteError) {
        throw deleteError;
      }

      if (annotations.length === 0) {
        return;
      }

      const rows = annotations.map((annotation) => ({
        id: annotation.id,
        user_id: userId,
        piece_id: pieceId,
        timestamp_seconds: annotation.timestampSeconds,
        label: annotation.label,
        note: annotation.note,
        category: annotation.category,
      }));

      const { error: insertError } = await supabase.from("annotations").insert(rows);

      if (insertError) {
        throw insertError;
      }
    },

    async clearCachedAnnotations(pieceId: string) {
      const userId = await getUserId(supabase);
      const { error } = await supabase
        .from("annotations")
        .delete()
        .eq("user_id", userId)
        .eq("piece_id", pieceId);

      if (error) {
        throw error;
      }
    },
  };
}
