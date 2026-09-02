"use client";

import { useQuery } from "@tanstack/react-query";

import { useSupabase } from "@/components/supabase-provider";
import { fetchAnnotations } from "@/lib/api/annotations";

function shouldRetryAnnotationFetch(failureCount: number, error: Error): boolean {
  if (failureCount >= 1) {
    return false;
  }

  const message = error.message.toLowerCase();

  return !(
    message.includes("429") ||
    message.includes("503") ||
    message.includes("quota") ||
    message.includes("high demand") ||
    message.includes("rate limit")
  );
}

export function useAnnotations(pieceId: string) {
  const { storage, isReady } = useSupabase();

  return useQuery({
    queryKey: ["annotations", pieceId],
    enabled: isReady,
    queryFn: async () => {
      const cached = await storage.getCachedAnnotations(pieceId);

      if (cached && cached.length > 0) {
        return cached;
      }

      const annotations = await fetchAnnotations(pieceId);
      await storage.setCachedAnnotations(pieceId, annotations);
      return annotations;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) =>
      shouldRetryAnnotationFetch(failureCount, error as Error),
  });
}
