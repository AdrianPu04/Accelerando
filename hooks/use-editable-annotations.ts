"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { setCachedAnnotations } from "@/lib/annotation-cache";
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
  const queryClient = useQueryClient();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const syncedFingerprintRef = useRef("");

  useEffect(() => {
    syncedFingerprintRef.current = "";
    setAnnotations([]);
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
      setCachedAnnotations(pieceId, sorted);
      queryClient.setQueryData(["annotations", pieceId], sorted);
    },
    [pieceId, queryClient],
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
