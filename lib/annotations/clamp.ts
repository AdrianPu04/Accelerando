import type { GeneratedAnnotation } from "@/lib/schemas/annotation";
import { guidedDurationSeconds } from "@/lib/prompts/generate-annotations";

/** Clamp AI timestamps into the guided listening window. */
export function clampGeneratedAnnotations(
  annotations: GeneratedAnnotation[],
  durationSeconds: number,
): GeneratedAnnotation[] {
  const maxTimestamp = Math.max(0, guidedDurationSeconds(durationSeconds) - 1);

  return annotations.map((annotation) => ({
    ...annotation,
    timestampSeconds: Math.min(
      maxTimestamp,
      Math.max(0, Math.round(annotation.timestampSeconds)),
    ),
  }));
}
