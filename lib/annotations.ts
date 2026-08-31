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
