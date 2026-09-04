"use client";

import { useEffect, useMemo } from "react";

import { Slider } from "@/components/ui/slider";
import {
  getActiveAnnotation,
  getAnnotationCategoryStyles,
} from "@/lib/annotations";
import { formatTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player-store";
import type { Annotation } from "@/types";

interface AnnotationTimelineProps {
  annotations: Annotation[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function AnnotationTimeline({
  annotations,
  currentTime,
  duration,
  onSeek,
}: AnnotationTimelineProps) {
  const activeAnnotationId = usePlayerStore(
    (state) => state.activeAnnotationId,
  );
  const setActiveAnnotationId = usePlayerStore(
    (state) => state.setActiveAnnotationId,
  );

  useEffect(() => {
    const active = getActiveAnnotation(annotations, currentTime);
    setActiveAnnotationId(active?.id ?? null);
  }, [annotations, currentTime, setActiveAnnotationId]);

  const sliderMax = duration > 0 ? duration : 1;
  const playheadPercent =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / sliderMax) * 100)) : 0;

  const sorted = useMemo(
    () =>
      [...annotations].sort(
        (a, b) => a.timestampSeconds - b.timestampSeconds,
      ),
    [annotations],
  );

  return (
    <section className="space-y-3" aria-label="Listening timeline">
      <div className="flex items-center justify-between font-mono text-[0.7rem] text-muted-foreground tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="relative space-y-3">
        <div className="relative h-10">
          <div
            className="absolute inset-x-0 bottom-0 h-px bg-border"
            aria-hidden
          />

          {sorted.map((annotation, index) => {
            const position =
              duration > 0
                ? (annotation.timestampSeconds / sliderMax) * 100
                : 0;
            const isActive = annotation.id === activeAnnotationId;
            const styles = getAnnotationCategoryStyles(annotation.category);
            const stemHeight = isActive ? "h-8" : index % 3 === 0 ? "h-6" : "h-4";

            return (
              <button
                key={annotation.id}
                type="button"
                className={cn(
                  "absolute bottom-0 z-10 flex -translate-x-1/2 flex-col items-center justify-end outline-none transition-[height,opacity,transform] duration-300 ease-out",
                  stemHeight,
                  isActive ? "z-20 opacity-100" : "opacity-55 hover:opacity-100",
                )}
                style={{ left: `${position}%` }}
                onClick={() => onSeek(annotation.timestampSeconds)}
                aria-label={`${annotation.label} at ${formatTime(annotation.timestampSeconds)}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={cn(
                    "w-px flex-1 rounded-full transition-[width,background-color] duration-300 ease-out",
                    styles.tick,
                    isActive && "w-0.5",
                  )}
                />
                <span
                  className={cn(
                    "mt-0.5 size-1.5 rounded-full transition-transform duration-300 ease-out",
                    styles.dot,
                    isActive && "scale-125",
                  )}
                />
              </button>
            );
          })}

          <div
            className="pointer-events-none absolute top-0 bottom-0 z-30 w-px bg-foreground/60"
            style={{ left: `${playheadPercent}%` }}
            aria-hidden
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border border-foreground/25 bg-background" />
          </div>
        </div>

        <Slider
          min={0}
          max={sliderMax}
          step={0.25}
          value={[currentTime]}
          onValueChange={(value) => {
            const nextTime = Array.isArray(value) ? value[0] : value;
            if (typeof nextTime === "number") {
              onSeek(nextTime);
            }
          }}
        />
      </div>
    </section>
  );
}
