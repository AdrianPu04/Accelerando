"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Piece } from "@/types";

interface RecommendationCardProps {
  piece: Piece;
  reasoning: string;
  isComplete: boolean;
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
}: RecommendationCardProps) {
  const summary = getReasoningSummary(reasoning);

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
          <Link
            href={`/listen/${piece.id}`}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Start listening
          </Link>
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
