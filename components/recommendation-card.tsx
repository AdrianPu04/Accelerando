"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Piece } from "@/types";

interface RecommendationCardProps {
  piece: Piece;
  isComplete: boolean;
  onStartListening: (pieceId: string) => void;
}

export function RecommendationCard({
  piece,
  isComplete,
  onStartListening,
}: RecommendationCardProps) {
  const router = useRouter();

  const handleStartListening = () => {
    onStartListening(piece.id);
    router.push(`/listen/${piece.id}`);
  };

  return (
    <section className="animate-fade-rise max-w-prose space-y-4 border-t border-border pt-8">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Up next
        <span className="mx-2 text-border">·</span>
        {piece.era}
      </p>
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
        {piece.composer} — {piece.title}
      </h2>
      {piece.movement ? (
        <p className="text-muted-foreground">{piece.movement}</p>
      ) : null}
      <Button
        type="button"
        size="sm"
        disabled={!isComplete}
        onClick={handleStartListening}
        className="transition-opacity duration-300"
      >
        {isComplete ? "Start listening" : "Preparing…"}
      </Button>
    </section>
  );
}
