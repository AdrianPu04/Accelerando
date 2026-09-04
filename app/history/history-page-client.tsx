"use client";

import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { SessionTimeline } from "@/components/session-timeline";
import { ErrorPanel, LoadingPanel } from "@/components/status-panel";
import { useSupabase } from "@/components/supabase-provider";
import { formatStorageError, getErrorMessage } from "@/lib/user-messages";
import type { SessionWithDetails } from "@/types";

export function HistoryPageClient() {
  const { storage, isReady } = useSupabase();
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;
    setIsLoadingHistory(true);
    setLoadError(null);

    void storage
      .getSessionHistory()
      .then((history) => {
        if (!cancelled) {
          setSessions(history);
          setLoadError(null);
        }
      })
      .catch((error) => {
        console.error("Failed to load history:", error);
        if (!cancelled) {
          setSessions([]);
          setLoadError(formatStorageError(getErrorMessage(error)).description);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingHistory(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, reloadToken, storage]);

  return (
    <AppShell>
      <header className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Your journey
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Listening history
        </h1>
        <p className="text-muted-foreground">
          Every piece, reflection, and recommendation in the chain of choices
          that shaped what you listened to next.
        </p>
      </header>

      {isLoadingHistory ? (
        <LoadingPanel
          title="Loading your history"
          description="Pulling sessions, reflections, and recommendations…"
        />
      ) : loadError ? (
        <ErrorPanel
          title="Couldn’t load history"
          description={loadError}
          onRetry={retry}
        />
      ) : (
        <SessionTimeline sessions={sessions} />
      )}
    </AppShell>
  );
}
