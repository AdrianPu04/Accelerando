import type { GeneratedAnnotation } from "@/lib/schemas/annotation";
import type { Annotation } from "@/types";

/** Latest annotation at or before the current playback time. */
export function getActiveAnnotation(
  annotations: Annotation[],
  currentTime: number,
): Annotation | null {
  return (
    [...annotations]
      .filter((annotation) => annotation.timestampSeconds <= currentTime)
      .sort((a, b) => b.timestampSeconds - a.timestampSeconds)[0] ?? null
  );
}

export function getAnnotationById(
  annotations: Annotation[],
  annotationId: string | null,
): Annotation | null {
  if (!annotationId) {
    return null;
  }

  return annotations.find((annotation) => annotation.id === annotationId) ?? null;
}

export function toAnnotations(
  pieceId: string,
  generated: GeneratedAnnotation[],
): Annotation[] {
  return [...generated]
    .sort((a, b) => a.timestampSeconds - b.timestampSeconds)
    .map((annotation, index) => ({
      id: `${pieceId}-gen-${index + 1}`,
      pieceId,
      ...annotation,
    }));
}
