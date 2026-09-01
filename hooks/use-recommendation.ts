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
  const fetchedForReflectionIdRef = useRef<string | null>(null);

  const annotationsReady = annotations.length > 0;

  const runRecommendation = useCallback(
    (activeReflection: Reflection, snapshot: Annotation[]) => {
      setRecommendedPiece(null);
      setReasoning("");
      setError(null);
      setStatus("loading");

      const controller = new AbortController();

      void streamRecommendation(
        {
          pieceId,
          reflection: {
            id: activeReflection.id,
            text: activeReflection.text,
            createdAt: activeReflection.createdAt,
          },
          annotations: snapshot.map((annotation) => ({
            timestampSeconds: annotation.timestampSeconds,
            label: annotation.label,
            note: annotation.note,
            category: annotation.category,
          })),
        },
        {
          onPiece: (piece) => {
            setRecommendedPiece(piece);
            setStatus("streaming");
          },
          onDelta: (text) => {
            setReasoning((current) => current + text);
          },
          onDone: () => {
            setStatus("complete");
          },
          onError: (message) => {
            setError(message);
            setStatus("error");
          },
        },
        controller.signal,
      );

      return () => controller.abort();
    },
    [pieceId],
  );

  useEffect(() => {
    if (!reflection || !annotationsReady) {
      return;
    }

    const isRetry = attempt > 0;
    const alreadyFetched =
      fetchedForReflectionIdRef.current === reflection.id && !isRetry;

    if (alreadyFetched) {
      return;
    }

    if (fetchedForReflectionIdRef.current !== reflection.id) {
      annotationsSnapshotRef.current = [...annotations];
    }

    fetchedForReflectionIdRef.current = reflection.id;

    return runRecommendation(reflection, annotationsSnapshotRef.current);
  }, [annotationsReady, attempt, reflection, runRecommendation]);

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
