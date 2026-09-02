"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSupabase } from "@/components/supabase-provider";
import { formatStorageError, getErrorMessage } from "@/lib/user-messages";
import type { Annotation, AnnotationCategory } from "@/types";

export type AnnotationUpdate = Partial<
  Pick<Annotation, "label" | "note" | "timestampSeconds" | "category">
>;

function sortAnnotations(annotations: Annotation[]): Annotation[] {
  return [...annotations].sort(
    (a, b) => a.timestampSeconds - b.timestampSeconds,
  );
}

function getAnnotationsFingerprint(annotations: Annotation[]): string {
  return annotations
    .map(
      (annotation) =>
        `${annotation.id}:${annotation.timestampSeconds}:${annotation.label}:${annotation.note}:${annotation.category}`,
    )
    .join("|");
}

export function useEditableAnnotations(
  pieceId: string,
  sourceAnnotations: Annotation[] | undefined,
) {
  const { storage } = useSupabase();
  const queryClient = useQueryClient();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const syncedFingerprintRef = useRef("");

  useEffect(() => {
    syncedFingerprintRef.current = "";
    setAnnotations([]);
    setSaveError(null);
  }, [pieceId]);

  useEffect(() => {
    if (!sourceAnnotations) {
      return;
    }

    const fingerprint = getAnnotationsFingerprint(sourceAnnotations);
    if (syncedFingerprintRef.current === fingerprint) {
      return;
    }

    syncedFingerprintRef.current = fingerprint;
    setAnnotations(sourceAnnotations);
  }, [sourceAnnotations]);

  const persist = useCallback(
    (next: Annotation[]) => {
      const sorted = sortAnnotations(next);
      syncedFingerprintRef.current = getAnnotationsFingerprint(sorted);
      setAnnotations(sorted);
      setSaveError(null);

      void storage.setCachedAnnotations(pieceId, sorted).catch((error) => {
        setSaveError(formatStorageError(getErrorMessage(error)).description);
      });
      queryClient.setQueryData(["annotations", pieceId], sorted);
    },
    [pieceId, queryClient, storage],
  );

  const updateAnnotation = useCallback(
    (annotationId: string, updates: AnnotationUpdate) => {
      persist(
        annotations.map((annotation) =>
          annotation.id === annotationId
            ? { ...annotation, ...updates }
            : annotation,
        ),
      );
    },
    [annotations, persist],
  );

  const deleteAnnotation = useCallback(
    (annotationId: string) => {
      persist(annotations.filter((annotation) => annotation.id !== annotationId));
    },
    [annotations, persist],
  );

  return {
    annotations,
    updateAnnotation,
    deleteAnnotation,
    saveError,
  };
}

export const ANNOTATION_CATEGORIES: AnnotationCategory[] = [
  "theme",
  "structure",
  "orchestration",
  "harmony",
  "dynamics",
  "other",
];
