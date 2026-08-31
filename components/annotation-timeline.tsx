"use client";

import { useEffect } from "react";

import { Slider } from "@/components/ui/slider";
import { getActiveAnnotation } from "@/lib/annotations";
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="relative px-1 pt-4 pb-2">
        <div className="pointer-events-none absolute inset-x-1 top-0 flex h-4 items-end">
          {annotations.map((annotation) => {
            const position =
              duration > 0
                ? (annotation.timestampSeconds / sliderMax) * 100
                : 0;
            const isActive = annotation.id === activeAnnotationId;

            return (
              <button
                key={annotation.id}
                type="button"
                className={cn(
                  "pointer-events-auto absolute bottom-0 size-2.5 -translate-x-1/2 rounded-full transition-transform",
                  isActive
                    ? "scale-125 bg-primary ring-2 ring-primary/30"
                    : "bg-muted-foreground/60 hover:bg-primary/80",
                )}
                style={{ left: `${position}%` }}
                onClick={() => onSeek(annotation.timestampSeconds)}
                aria-label={`${annotation.label} at ${formatTime(annotation.timestampSeconds)}`}
                aria-current={isActive ? "true" : undefined}
              />
            );
          })}
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
    </div>
  );
}
