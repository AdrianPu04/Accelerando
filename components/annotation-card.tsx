"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { getAnnotationById } from "@/lib/annotations";
import { formatTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player-store";
import type { Annotation } from "@/types";

interface AnnotationCardProps {
  annotations: Annotation[];
}

export function AnnotationCard({ annotations }: AnnotationCardProps) {
  const activeAnnotationId = usePlayerStore(
    (state) => state.activeAnnotationId,
  );
  const annotation = getAnnotationById(annotations, activeAnnotationId);
  const [displayed, setDisplayed] = useState<Annotation | null>(annotation);
  const [isVisible, setIsVisible] = useState(true);
  const displayedIdRef = useRef<string | null>(annotation?.id ?? null);

  useEffect(() => {
    const nextId = annotation?.id ?? null;

    if (nextId === displayedIdRef.current) {
      setDisplayed(annotation);
      return;
    }

    displayedIdRef.current = nextId;
    setIsVisible(false);

    const swapTimer = window.setTimeout(() => {
      setDisplayed(annotation);
      setIsVisible(true);
    }, 160);

    return () => window.clearTimeout(swapTimer);
  }, [annotation]);

  if (!displayed) {
    return (
      <div
        className="rounded-lg border border-dashed border-border/80 px-4 py-5 text-sm text-muted-foreground"
        aria-live="polite"
      >
        Play the recording — guided notes appear as landmarks pass.
      </div>
    );
  }

  return (
    <article
      className={cn(
        "space-y-3 transition-opacity duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{displayed.category}</Badge>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatTime(displayed.timestampSeconds)}
        </span>
      </div>
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        {displayed.label}
      </h2>
      <p className="text-[0.95rem] leading-relaxed text-foreground/90">
        {displayed.note}
      </p>
    </article>
  );
}
