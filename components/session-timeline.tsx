"use client";

import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PieceChip } from "@/components/piece-chip";
import { EmptyPanel } from "@/components/status-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SessionWithDetails } from "@/types";

interface SessionTimelineProps {
  sessions: SessionWithDetails[];
}

interface JourneyChartPoint {
  index: number;
  date: string;
  label: string;
  timestamp: number;
}

function formatSessionDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function getPieceLabel(session: SessionWithDetails): string {
  if (session.piece) {
    return `${session.piece.composer} — ${session.piece.title}`;
  }

  return session.session.pieceId;
}

function buildJourneyChartData(sessions: SessionWithDetails[]): JourneyChartPoint[] {
  return [...sessions]
    .sort((a, b) => a.session.listenedAt.localeCompare(b.session.listenedAt))
    .map((session, index) => ({
      index: index + 1,
      date: formatSessionDate(session.session.listenedAt),
      label: getPieceLabel(session),
      timestamp: new Date(session.session.listenedAt).getTime(),
    }));
}

function JourneyChart({ sessions }: { sessions: SessionWithDetails[] }) {
  const data = buildJourneyChartData(sessions);

  if (data.length < 2) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Listening journey</CardTitle>
        <CardDescription>
          {data.length} sessions over time — each step builds on the last.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                dataKey="index"
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Session",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) {
                    return null;
                  }

                  const point = payload[0].payload as JourneyChartPoint;
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm">
                      <p className="font-medium">{point.label}</p>
                      <p className="text-muted-foreground">{point.date}</p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="index"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-2)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
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

      <div className={cn("space-y-3", isLast ? "pb-0" : "pb-10")}>
        <div className="flex flex-wrap items-center gap-2">
          <time
            dateTime={session.session.listenedAt}
            className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
          >
            {formatSessionDateTime(session.session.listenedAt)}
          </time>
          {isInProgress ? (
            <Badge variant="outline">In progress</Badge>
          ) : null}
        </div>

        {piece ? (
          <PieceChip
            piece={piece}
            actionLabel={isInProgress ? "Resume" : "Listen again"}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{session.session.pieceId}</CardTitle>
              <CardDescription>Piece details unavailable</CardDescription>
            </CardHeader>
          </Card>
        )}

        {reflection ? (
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reflection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                &ldquo;{reflection.text}&rdquo;
              </p>
            </CardContent>
          </Card>
        ) : null}

        {recommendation ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Recommended next
            </p>
            <Card>
              <CardHeader>
                <CardDescription>
                  Based on your reflection and the annotations
                </CardDescription>
                <CardTitle className="text-base">
                  {recommendation.toPiece.composer} —{" "}
                  {recommendation.toPiece.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
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
    <div className="space-y-8">
      <JourneyChart sessions={sessions} />
      <div>
        <h2 className="mb-6 font-heading text-sm font-semibold tracking-widest uppercase">
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
