"use client";

import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Piece } from "@/types";

interface RecommendationCardProps {
  piece: Piece;
  reasoning: string;
  isComplete: boolean;
  onStartListening: (pieceId: string) => void;
}

function getReasoningSummary(reasoning: string): string {
  const paragraph = reasoning.split("\n").find((line) => line.trim())?.trim();
  if (!paragraph) {
    return "";
  }

  if (paragraph.length <= 180) {
    return paragraph;
  }

  return `${paragraph.slice(0, 177).trimEnd()}…`;
}

export function RecommendationCard({
  piece,
  reasoning,
  isComplete,
  onStartListening,
}: RecommendationCardProps) {
  const router = useRouter();
  const summary = getReasoningSummary(reasoning);

  const handleStartListening = () => {
    onStartListening(piece.id);
    router.push(`/listen/${piece.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Up next
        </p>
        <Badge variant="secondary">{piece.era}</Badge>
        <CardTitle>
          {piece.composer} — {piece.title}
        </CardTitle>
        {piece.movement ? (
          <CardDescription>{piece.movement}</CardDescription>
        ) : null}
      </CardHeader>

      {summary ? (
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </CardContent>
      ) : null}

      {isComplete ? (
        <CardFooter>
          <Button type="button" size="sm" onClick={handleStartListening}>
            Start listening
          </Button>
        </CardFooter>
      ) : (
        <CardFooter>
          <Button type="button" size="sm" disabled>
            Preparing recommendation…
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
