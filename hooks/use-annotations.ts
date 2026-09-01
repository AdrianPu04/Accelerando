"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getCachedAnnotations,
  setCachedAnnotations,
} from "@/lib/annotation-cache";
import { fetchAnnotations } from "@/lib/api/annotations";

export function useAnnotations(pieceId: string) {
  return useQuery({
    queryKey: ["annotations", pieceId],
    queryFn: async () => {
      const cached = getCachedAnnotations(pieceId);

      if (cached) {
        return cached;
      }

      const annotations = await fetchAnnotations(pieceId);
      setCachedAnnotations(pieceId, annotations);
      return annotations;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
