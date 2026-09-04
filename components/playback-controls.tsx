"use client";

import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  isReady: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export function PlaybackControls({
  isReady,
  isPlaying,
  onPlay,
  onPause,
}: PlaybackControlsProps) {
  return (
    <button
      type="button"
      disabled={!isReady}
      onClick={isPlaying ? onPause : onPlay}
      aria-label={isPlaying ? "Pause" : "Play"}
      className={cn(
        "group inline-flex items-center gap-3 outline-none transition-opacity",
        "disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:ring-2 focus-visible:ring-ring/30",
      )}
    >
      <span
        className={cn(
          "relative flex size-11 items-center justify-center rounded-full border border-foreground/25 bg-transparent",
          "transition-[border-color,background-color,transform] duration-200 ease-out",
          "group-hover:border-foreground group-hover:bg-foreground/[0.04]",
          "group-active:scale-[0.97]",
          "group-focus-visible:border-foreground",
        )}
      >
        {isPlaying ? (
          <span className="flex items-center gap-[5px]" aria-hidden>
            <span className="h-3.5 w-[3px] rounded-[1px] bg-foreground" />
            <span className="h-3.5 w-[3px] rounded-[1px] bg-foreground" />
          </span>
        ) : (
          <span
            className="ml-0.5 size-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-foreground"
            aria-hidden
          />
        )}
      </span>

      <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors group-hover:text-foreground">
        {isPlaying ? "Pause" : "Play"}
      </span>
    </button>
  );
}
