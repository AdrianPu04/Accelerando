"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SessionWithDetails } from "@/types";

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

export function JourneyChart({ sessions }: { sessions: SessionWithDetails[] }) {
  const data = buildJourneyChartData(sessions);

  if (data.length < 2) {
    return null;
  }

  return (
    <section className="space-y-4 border-y border-border py-6">
      <div className="space-y-1">
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Listening journey
        </h2>
        <p className="text-sm text-muted-foreground">
          {data.length} sessions over time — each step builds on the last.
        </p>
      </div>
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
                  <div className="border border-border bg-background px-3 py-2 text-sm">
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
    </section>
  );
}
