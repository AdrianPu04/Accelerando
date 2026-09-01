"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PieceChip } from "@/components/piece-chip";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getInProgressSession,
  getRecentRecommendations,
} from "@/lib/listening-storage";
import { getPieceById } from "@/lib/pieces";
import { cn } from "@/lib/utils";
import type { ListeningSession, Piece, Recommendation } from "@/types";

interface HomePageClientProps {
  pieces: Piece[];
}

export function HomePageClient({ pieces }: HomePageClientProps) {
  const [inProgressSession, setInProgressSession] =
    useState<ListeningSession | null>(null);
  const [recentRecommendations, setRecentRecommendations] = useState<
    Recommendation[]
  >([]);

  useEffect(() => {
    setInProgressSession(getInProgressSession());
    setRecentRecommendations(getRecentRecommendations(3));
  }, []);

  const inProgressPiece = inProgressSession
    ? getPieceById(inProgressSession.pieceId)
    : undefined;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Guided listening
        </p>
        <h1 className="font-heading text-4xl font-semibold">Accelerando</h1>
        <p className="max-w-xl text-muted-foreground">
          Listen with AI-annotated timelines, reflect on what you hear, and
          discover what to explore next — with reasoning, not just a playlist.
        </p>
      </header>

      {inProgressPiece ? (
        <section className="space-y-3">
          <h2 className="font-heading text-sm font-semibold tracking-widest uppercase">
            Continue listening
          </h2>
          <PieceChip piece={inProgressPiece} actionLabel="Resume" />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold tracking-widest uppercase">
          Start listening
        </h2>
        <div className="grid gap-3">
          {pieces.map((piece) => (
            <PieceChip key={piece.id} piece={piece} />
          ))}
        </div>
      </section>

      {recentRecommendations.length > 0 ? (
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
