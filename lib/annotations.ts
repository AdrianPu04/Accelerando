import type { GeneratedAnnotation } from "@/lib/schemas/annotation";
import type { Annotation, AnnotationCategory } from "@/types";

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
    .map((annotation) => ({
      id: crypto.randomUUID(),
      pieceId,
      ...annotation,
    }));
}

/** Quiet category colors for timeline ticks (uses existing chart tokens). */
export function getAnnotationCategoryStyles(category: AnnotationCategory): {
  tick: string;
  dot: string;
} {
  switch (category) {
    case "theme":
      return {
        tick: "bg-[var(--chart-2)]",
        dot: "bg-[var(--chart-2)]",
      };
    case "structure":
      return {
        tick: "bg-foreground/65",
        dot: "bg-foreground/80",
      };
    case "orchestration":
      return {
        tick: "bg-[var(--chart-3)]",
        dot: "bg-[var(--chart-3)]",
      };
    case "harmony":
      return {
        tick: "bg-[var(--chart-4)]",
        dot: "bg-[var(--chart-4)]",
      };
    case "dynamics":
      return {
        tick: "bg-destructive/65",
        dot: "bg-destructive/80",
      };
    case "other":
    default:
      return {
        tick: "bg-muted-foreground/55",
        dot: "bg-muted-foreground/70",
      };
  }
}
