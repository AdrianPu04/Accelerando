"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getOrCreateCurrentSession,
  getReflectionForSession,
  saveReflectionForSession,
} from "@/lib/listening-storage";
import type { Reflection } from "@/types";

export function useListeningSession(pieceId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reflection, setReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    const session = getOrCreateCurrentSession(pieceId);
    setSessionId(session.id);
    setReflection(getReflectionForSession(session.id));
  }, [pieceId]);

  const persistReflection = useCallback(
    (nextReflection: Reflection) => {
      const activeSessionId =
        sessionId ?? getOrCreateCurrentSession(pieceId).id;

      saveReflectionForSession(activeSessionId, nextReflection);
      setSessionId(activeSessionId);
      setReflection(nextReflection);
    },
    [pieceId, sessionId],
  );

  return {
    sessionId,
    reflection,
    persistReflection,
  };
}
