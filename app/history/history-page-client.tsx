"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SessionTimeline } from "@/components/session-timeline";
import { LoadingPanel } from "@/components/status-panel";
import { useSupabase } from "@/components/supabase-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

    void storage.getSessionHistory().then((history) => {
      if (!cancelled) {
        setSessions(history);
        setIsLoadingHistory(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isReady, storage]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-4">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 w-fit gap-1",
          )}
        >
          <ArrowLeft className="size-4" />
          Accelerando
        </Link>
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Your journey
          </p>
          <h1 className="font-heading text-4xl font-semibold">
            Listening history
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Every piece, reflection, and recommendation — the chain of choices
            that shaped what you listened to next.
          </p>
        </div>
      </header>

      {isLoadingHistory ? (
        <LoadingPanel
          title="Loading your history"
          description="Pulling sessions, reflections, and recommendations…"
        />
      ) : (
        <SessionTimeline sessions={sessions} />
      )}
    </div>
  );
}
