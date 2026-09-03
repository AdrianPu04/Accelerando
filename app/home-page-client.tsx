"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Guided listening
          </p>
          <div className="flex items-center gap-1">
            <Link
              href="/library"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground",
              )}
            >
              Library
            </Link>
            <Link
              href="/history"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground",
              )}
            >
              History
            </Link>
          </div>
        </div>
        <h1 className="font-heading text-4xl font-semibold">Accelerando</h1>
        <p className="max-w-xl text-muted-foreground">
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

      {!isLoadingActivity && inProgressPiece ? (
        <section className="space-y-3">
          <h2 className="font-heading text-sm font-semibold tracking-widest uppercase">
            Continue listening
          </h2>
          <PieceChip piece={inProgressPiece} actionLabel="Resume" />
        </section>
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

      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold tracking-widest uppercase">
          Start here
        </h2>
        <div className="grid gap-3">
          {pieces.map((piece) => (
            <PieceChip key={piece.id} piece={piece} />
          ))}
        </div>
      </section>

      {!isLoadingActivity && recentRecommendations.length > 0 ? (
        <section className="space-y-3">
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
  );
}
