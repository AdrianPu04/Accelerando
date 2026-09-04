"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { PieceChip } from "@/components/piece-chip";
import { EmptyPanel, LoadingPanel } from "@/components/status-panel";
import { useSupabase } from "@/components/supabase-provider";
import { buttonVariants } from "@/components/ui/button";
import { fetchPieceById } from "@/lib/pieces/client";
import { cn } from "@/lib/utils";
import type { ListeningSession, Piece, Recommendation } from "@/types";

interface HomePageClientProps {
  pieces: Piece[];
}

export function HomePageClient({ pieces }: HomePageClientProps) {
  const { storage, isReady } = useSupabase();
  const [inProgressSession, setInProgressSession] =
    useState<ListeningSession | null>(null);
  const [inProgressPiece, setInProgressPiece] = useState<Piece | null>(null);
  const [recentRecommendations, setRecentRecommendations] = useState<
    Recommendation[]
  >([]);
  const [fromPieceLabels, setFromPieceLabels] = useState<Record<string, string>>(
    {},
  );
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

        if (cancelled) {
          return;
        }

        setInProgressSession(inProgress);
        setRecentRecommendations(recommendations);

        const pieceIds = new Set<string>();
        if (inProgress) {
          pieceIds.add(inProgress.pieceId);
        }
        for (const recommendation of recommendations) {
          pieceIds.add(recommendation.fromPieceId);
        }

        const resolved = await Promise.all(
          [...pieceIds].map(async (pieceId) => {
            try {
              const piece = await fetchPieceById(pieceId);
              return [pieceId, piece] as const;
            } catch {
              return [pieceId, null] as const;
            }
          }),
        );

        if (cancelled) {
          return;
        }

        const labels: Record<string, string> = {};
        let continuePiece: Piece | null = null;

        for (const [pieceId, piece] of resolved) {
          if (!piece) {
            continue;
          }

          labels[pieceId] = piece.composer;
          if (inProgress && pieceId === inProgress.pieceId) {
            continuePiece = piece;
          }
        }

        setFromPieceLabels(labels);
        setInProgressPiece(continuePiece);
      } catch (error) {
        console.error("Failed to load home activity:", error);
        if (!cancelled) {
          setInProgressSession(null);
          setInProgressPiece(null);
          setRecentRecommendations([]);
          setFromPieceLabels({});
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

  const isFirstVisit =
    isReady &&
    !isLoadingActivity &&
    !inProgressPiece &&
    recentRecommendations.length === 0;

  return (
    <AppShell>
      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Guided listening
        </p>
        <p className="font-heading text-3xl font-semibold tracking-tight text-balance">
          Listen with annotated timelines, then discover what to hear next —
          with reasoning, not just a playlist.
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
          description="Start with a featured recording below, or browse the library. Reflect after you listen — Accelerando will suggest what to explore next."
          action={
            <Link href="/library" className={cn(buttonVariants({ size: "sm" }))}>
              Browse library
            </Link>
          }
        />
      ) : null}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:items-start">
        <div className="space-y-10">
          {!isLoadingActivity && inProgressPiece && inProgressSession ? (
            <section>
              <h2 className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Continue listening
              </h2>
              <PieceChip piece={inProgressPiece} actionLabel="Resume" />
            </section>
          ) : null}

          <section>
            <h2 className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Start here
            </h2>
            <div>
              {pieces.map((piece) => (
                <PieceChip key={piece.id} piece={piece} />
              ))}
            </div>
          </section>
        </div>

        {!isLoadingActivity && recentRecommendations.length > 0 ? (
          <section className="lg:sticky lg:top-8">
            <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Recent recommendations
            </h2>
            <div className="divide-y divide-border border-y border-border">
              {recentRecommendations.map((recommendation) => (
                <article key={recommendation.id} className="space-y-3 py-5">
                  <p className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
                    From{" "}
                    {fromPieceLabels[recommendation.fromPieceId] ??
                      "a previous piece"}
                  </p>
                  <h3 className="font-heading text-xl font-semibold tracking-tight text-balance">
                    {recommendation.toPiece.composer} —{" "}
                    {recommendation.toPiece.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {recommendation.reasoning}
                  </p>
                  <Link
                    href={`/listen/${recommendation.toPiece.id}`}
                    className="inline-block text-xs font-semibold tracking-widest uppercase underline-offset-4 hover:underline"
                  >
                    Start listening
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
