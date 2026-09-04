"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { PieceChip } from "@/components/piece-chip";
import { EmptyPanel } from "@/components/status-panel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionWithDetails } from "@/types";

const JourneyChart = dynamic(
  () =>
    import("@/components/journey-chart").then((mod) => mod.JourneyChart),
  {
    ssr: false,
    loading: () => (
      <div className="border-y border-dashed border-border py-8 text-sm text-muted-foreground">
        Loading journey chart…
      </div>
    ),
  },
);

interface SessionTimelineProps {
  sessions: SessionWithDetails[];
}

function formatSessionDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SessionEntry({
  session,
  isLast,
}: {
  session: SessionWithDetails;
  isLast: boolean;
}) {
  const { piece, reflection, recommendation, isInProgress } = session;

  return (
    <article className="relative pl-8">
      {!isLast ? (
        <div
          aria-hidden
          className="absolute top-2 left-[11px] h-full w-px bg-border"
        />
      ) : null}
      <div
        aria-hidden
        className="absolute top-2 left-0 size-[22px] rounded-full border-2 border-chart-2 bg-background"
      />

      <div className={cn("space-y-4", isLast ? "pb-0" : "pb-10")}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <time
            dateTime={session.session.listenedAt}
            className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
          >
            {formatSessionDateTime(session.session.listenedAt)}
          </time>
          {isInProgress ? (
            <span className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
              In progress
            </span>
          ) : null}
        </div>

        {piece ? (
          <PieceChip
            piece={piece}
            actionLabel={isInProgress ? "Resume" : "Listen again"}
          />
        ) : (
          <div className="border-b border-border py-4">
            <p className="font-heading text-lg font-semibold tracking-tight">
              {session.session.pieceId}
            </p>
            <p className="text-sm text-muted-foreground">
              Piece details unavailable
            </p>
          </div>
        )}

        {reflection ? (
          <div className="space-y-2 border-y border-dashed border-border py-4">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Reflection
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground italic">
              &ldquo;{reflection.text}&rdquo;
            </p>
          </div>
        ) : null}

        {recommendation ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Recommended next
            </p>
            <h3 className="font-heading text-xl font-semibold tracking-tight text-balance">
              {recommendation.toPiece.composer} — {recommendation.toPiece.title}
            </h3>
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {recommendation.reasoning}
            </p>
            <Link
              href={`/listen/${recommendation.toPiece.id}`}
              className="inline-block text-xs font-semibold tracking-widest uppercase underline-offset-4 hover:underline"
            >
              Start listening
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function SessionTimeline({ sessions }: SessionTimelineProps) {
  if (sessions.length === 0) {
    return (
      <EmptyPanel
        title="No listening history yet"
        description="Start a piece, reflect on what you hear, and your journey will appear here — piece by piece, with the reasoning that connects them."
        action={
          <Link href="/" className={cn(buttonVariants({ size: "sm" }))}>
            Start listening
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-10">
      <JourneyChart sessions={sessions} />
      <div>
        <h2 className="mb-6 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Session timeline
        </h2>
        <div>
          {sessions.map((session, index) => (
            <SessionEntry
              key={session.session.id}
              session={session}
              isLast={index === sessions.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
