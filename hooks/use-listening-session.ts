"use client";

import { useCallback, useEffect, useState } from "react";

import { useSupabase } from "@/components/supabase-provider";
import { formatStorageError, getErrorMessage } from "@/lib/user-messages";
import type { Reflection } from "@/types";

export function useListeningSession(pieceId: string) {
  const { storage, isReady } = useSupabase();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isPersistingReflection, setIsPersistingReflection] = useState(false);
  const [persistReflectionError, setPersistReflectionError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;
    setIsSessionLoading(true);

    void (async () => {
      try {
        const session = await storage.getOrCreateCurrentSession(pieceId);
        const existingReflection = await storage.getReflectionForSession(
          session.id,
        );

        if (!cancelled) {
          setSessionId(session.id);
          setReflection(existingReflection);
        }
      } finally {
        if (!cancelled) {
          setIsSessionLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, pieceId, storage]);

  const persistReflection = useCallback(
    async (nextReflection: Reflection) => {
      setIsPersistingReflection(true);
      setPersistReflectionError(null);

      try {
        const activeSessionId =
          sessionId ?? (await storage.getOrCreateCurrentSession(pieceId)).id;

        await storage.saveReflectionForSession(
          activeSessionId,
          nextReflection,
        );
        setSessionId(activeSessionId);
        setReflection(nextReflection);
      } catch (error) {
        const message = formatStorageError(getErrorMessage(error)).description;
        setPersistReflectionError(message);
        throw error;
      } finally {
        setIsPersistingReflection(false);
      }
    },
    [pieceId, sessionId, storage],
  );

  return {
    sessionId,
    reflection,
    persistReflection,
    isSessionLoading,
    isPersistingReflection,
    persistReflectionError,
    isReady,
  };
}
