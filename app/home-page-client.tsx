"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { PieceChip } from "@/components/piece-chip";
import { EmptyPanel, LoadingPanel } from "@/components/status-panel";
import { useSupabase } from "@/components/supabase-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPieceById } from "@/lib/pieces";
import { cn } from "@/lib/utils";
import type { ListeningSession, Piece, Recommendation } from "@/types";

interface HomePageClientProps {
  pieces: Piece[];
}

export function HomePageClient({ pieces }: HomePageClientProps) {
  const { storage, isReady } = useSupabase();
  const [inProgressSession, setInProgressSession] =
    useState<ListeningSession | null>(null);
  const [recentRecommendations, setRecentRecommendations] = useState<
    Recommendation[]
  >([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;
    setIsLoadingActivity(true);

    void (async () => {
      try {
        const [inProgress, recommendations] = await Promise.all([
          storage.getInProgressSession(),
          storage.getRecentRecommendations(3),
        ]);

        if (!cancelled) {
          setInProgressSession(inProgress);
          setRecentRecommendations(recommendations);
        }
      } catch (error) {
        console.error("Failed to load home activity:", error);
        if (!cancelled) {
          setInProgressSession(null);
          setRecentRecommendations([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingActivity(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReady, storage]);

  const inProgressPiece = inProgressSession
    ? getPieceById(inProgressSession.pieceId)
    : undefined;

  const isFirstVisit =
    isReady &&
    !isLoadingActivity &&
    !inProgressPiece &&
    recentRecommendations.length === 0;

  return (
    <AppShell>
      <header className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Guided listening
        </p>
        <h1 className="font-heading text-5xl font-semibold">Accelerando</h1>
        <p className="text-muted-foreground">
          Listen with AI-annotated timelines, reflect on what you hear, and
          discover what to explore next — with reasoning, not just a playlist.
        </p>
      </header>

      {isLoadingActivity ? (
        <LoadingPanel
          title="Loading your library"
          description="Fetching recent sessions and recommendations…"
        />
      ) : null}

      {isFirstVisit ? (
        <EmptyPanel
          title="Your listening journey starts here"
          description="Start with a featured recording below, or browse hundreds of Open Opus works in the library. Reflect after you listen — Accelerando will suggest what to explore next."
          action={
            <Link href="/library" className={cn(buttonVariants({ size: "sm" }))}>
              Browse library
            </Link>
          }
        />
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
        <div className="space-y-8">
          {!isLoadingActivity && inProgressPiece ? (
            <section className="space-y-3">
              <h2 className="font-heading text-sm font-semibold tracking-widest uppercase">
                Continue listening
              </h2>
              <PieceChip piece={inProgressPiece} actionLabel="Resume" />
            </section>
          ) : null}

          <section className="space-y-3">
            <h2 className="font-heading text-sm font-semibold tracking-widest uppercase">
              Start here
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {pieces.map((piece) => (
                <PieceChip key={piece.id} piece={piece} />
              ))}
            </div>
          </section>
        </div>

        {!isLoadingActivity && recentRecommendations.length > 0 ? (
          <section className="space-y-3 lg:sticky lg:top-8">
            <h2 className="font-heading text-sm font-semibold tracking-widest uppercase">
              Recent recommendations
            </h2>
            <div className="grid gap-3">
              {recentRecommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardHeader>
                    <CardDescription>
                      From{" "}
                      {getPieceById(recommendation.fromPieceId)?.composer ??
                        "a previous piece"}
                    </CardDescription>
                    <CardTitle>
                      {recommendation.toPiece.composer} —{" "}
                      {recommendation.toPiece.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {recommendation.reasoning}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/listen/${recommendation.toPiece.id}`}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      Start listening
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
