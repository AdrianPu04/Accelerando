"use client";

import { useCallback, useEffect, useState } from "react";

import { useSupabase } from "@/components/supabase-provider";
import type { Reflection } from "@/types";

export function useListeningSession(pieceId: string) {
  const { storage, isReady } = useSupabase();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reflection, setReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const session = await storage.getOrCreateCurrentSession(pieceId);
      const existingReflection = await storage.getReflectionForSession(
        session.id,
      );

      if (!cancelled) {
        setSessionId(session.id);
        setReflection(existingReflection);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, pieceId, storage]);

  const persistReflection = useCallback(
    (nextReflection: Reflection) => {
      void (async () => {
        const activeSessionId =
          sessionId ?? (await storage.getOrCreateCurrentSession(pieceId)).id;

        await storage.saveReflectionForSession(
          activeSessionId,
          nextReflection,
        );
        setSessionId(activeSessionId);
        setReflection(nextReflection);
      })();
    },
    [pieceId, sessionId, storage],
  );

  return {
    sessionId,
    reflection,
    persistReflection,
    isReady,
  };
}
