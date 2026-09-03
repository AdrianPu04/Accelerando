"use client";

import { useEffect, useRef, useState } from "react";

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
        className="border-y border-dashed border-border py-8 text-sm text-muted-foreground"
        aria-live="polite"
      >
        Play the recording — guided notes appear as landmarks pass.
      </div>
    );
  }

  return (
    <article
      className={cn(
        "max-w-[40rem] space-y-5 transition-opacity duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
        <span>{displayed.category}</span>
        <span className="font-mono tracking-normal normal-case tabular-nums">
          {formatTime(displayed.timestampSeconds)}
        </span>
      </div>
      <h2 className="font-heading text-4xl font-semibold tracking-tight text-balance">
        {displayed.label}
      </h2>
      <p className="text-lg leading-[1.75] text-foreground/90">
        {displayed.note}
      </p>
    </article>
  );
}
