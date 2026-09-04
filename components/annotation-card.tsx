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
  const [phase, setPhase] = useState<"in" | "out">("in");
  const displayedIdRef = useRef<string | null>(annotation?.id ?? null);

  useEffect(() => {
    const nextId = annotation?.id ?? null;

    if (nextId === displayedIdRef.current) {
      setDisplayed(annotation);
      return;
    }

    displayedIdRef.current = nextId;
    setPhase("out");

    const swapTimer = window.setTimeout(() => {
      setDisplayed(annotation);
      setPhase("in");
    }, 140);

    return () => window.clearTimeout(swapTimer);
  }, [annotation]);

  if (!displayed) {
    return (
      <div
        className="animate-fade-in border-y border-dashed border-border py-8 text-sm text-muted-foreground"
        aria-live="polite"
      >
        Play the recording — guided notes appear as landmarks pass.
      </div>
    );
  }

  return (
    <article
      key={displayed.id}
      className={cn(
        "max-w-[40rem] space-y-5 transition-[opacity,transform] duration-300 ease-out",
        phase === "in"
          ? "translate-y-0 opacity-100"
          : "translate-y-1 opacity-0",
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
