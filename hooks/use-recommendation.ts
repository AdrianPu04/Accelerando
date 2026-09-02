"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { streamRecommendation } from "@/lib/api/recommendations";
import type { Annotation, Piece, Reflection } from "@/types";

type RecommendationStatus =
  | "idle"
  | "loading"
  | "streaming"
  | "complete"
  | "error";

export function useRecommendation(
  pieceId: string,
  reflection: Reflection | null,
  annotations: Annotation[],
) {
  const [recommendedPiece, setRecommendedPiece] = useState<Piece | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [status, setStatus] = useState<RecommendationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const annotationsSnapshotRef = useRef<Annotation[]>([]);
  const completedForReflectionIdRef = useRef<string | null>(null);
  const inFlightReflectionIdRef = useRef<string | null>(null);

  const annotationsReady = annotations.length > 0;

  useEffect(() => {
    if (!reflection || !annotationsReady) {
      return;
    }

    const isRetry = attempt > 0;

    if (
      completedForReflectionIdRef.current === reflection.id &&
      !isRetry
    ) {
      return;
    }

    if (inFlightReflectionIdRef.current === reflection.id && !isRetry) {
      return;
    }

    annotationsSnapshotRef.current = [...annotations];
    inFlightReflectionIdRef.current = reflection.id;

    setRecommendedPiece(null);
    setReasoning("");
    setError(null);
    setStatus("loading");

    const controller = new AbortController();
    let cancelled = false;

    void streamRecommendation(
      {
        pieceId,
        reflection: {
          id: reflection.id,
          text: reflection.text,
          createdAt: reflection.createdAt,
        },
        annotations: annotationsSnapshotRef.current.map((annotation) => ({
          timestampSeconds: annotation.timestampSeconds,
          label: annotation.label,
          note: annotation.note,
          category: annotation.category,
        })),
      },
      {
        onPiece: (piece) => {
          if (cancelled) {
            return;
          }

          setRecommendedPiece(piece);
          setStatus("streaming");
        },
        onDelta: (text) => {
          if (cancelled) {
            return;
          }

          setReasoning((current) => current + text);
        },
        onDone: () => {
          if (cancelled) {
            return;
          }

          completedForReflectionIdRef.current = reflection.id;
          inFlightReflectionIdRef.current = null;
          setStatus("complete");
        },
        onError: (message) => {
          if (cancelled) {
            return;
          }

          inFlightReflectionIdRef.current = null;
          setError(message);
          setStatus("error");
        },
      },
      controller.signal,
    );

    return () => {
      cancelled = true;
      controller.abort();

      if (inFlightReflectionIdRef.current === reflection.id) {
        inFlightReflectionIdRef.current = null;
      }
    };
  }, [annotationsReady, attempt, pieceId, reflection]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  return {
    recommendedPiece,
    reasoning,
    status,
    error,
    retry,
    isLoading: status === "loading",
    isStreaming: status === "streaming",
    isComplete: status === "complete",
  };
}
