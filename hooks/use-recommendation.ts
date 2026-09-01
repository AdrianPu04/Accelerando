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
  const startedForReflectionId = useRef<string | null>(null);

  const runRecommendation = useCallback(
    (activeReflection: Reflection) => {
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
          annotations: annotations.map((annotation) => ({
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
    [annotations, pieceId],
  );

  useEffect(() => {
    if (!reflection || annotations.length === 0) {
      return;
    }

    if (startedForReflectionId.current === reflection.id && attempt === 0) {
      return;
    }

    startedForReflectionId.current = reflection.id;
    return runRecommendation(reflection);
  }, [annotations.length, attempt, reflection, runRecommendation]);

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
