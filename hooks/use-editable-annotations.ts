"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

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

export function useEditableAnnotations(
  pieceId: string,
  sourceAnnotations: Annotation[],
) {
  const queryClient = useQueryClient();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    setAnnotations(sourceAnnotations);
  }, [sourceAnnotations]);

  const persist = useCallback(
    (next: Annotation[]) => {
      const sorted = sortAnnotations(next);
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
