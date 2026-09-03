"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { SessionTimeline } from "@/components/session-timeline";
import { LoadingPanel } from "@/components/status-panel";
import { useSupabase } from "@/components/supabase-provider";
import type { SessionWithDetails } from "@/types";

export function HistoryPageClient() {
  const { storage, isReady } = useSupabase();
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;
    setIsLoadingHistory(true);

    void storage
      .getSessionHistory()
      .then((history) => {
        if (!cancelled) {
          setSessions(history);
        }
      })
      .catch((error) => {
        console.error("Failed to load history:", error);
        if (!cancelled) {
          setSessions([]);
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
  }, [isReady, storage]);

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
      ) : (
        <SessionTimeline sessions={sessions} />
      )}
    </AppShell>
  );
}
