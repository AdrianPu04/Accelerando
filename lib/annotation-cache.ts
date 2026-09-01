import type { Annotation } from "@/types";

const CACHE_PREFIX = "accelerando:annotations:";

function getCacheKey(pieceId: string): string {
  return `${CACHE_PREFIX}${pieceId}`;
}

export function getCachedAnnotations(pieceId: string): Annotation[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(getCacheKey(pieceId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Annotation[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setCachedAnnotations(
  pieceId: string,
  annotations: Annotation[],
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getCacheKey(pieceId), JSON.stringify(annotations));
}

export function clearCachedAnnotations(pieceId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(getCacheKey(pieceId));
}
