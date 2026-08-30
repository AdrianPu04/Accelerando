"use client";

import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/format-time";
import { PauseIcon, PlayIcon } from "lucide-react";

interface PlaybackControlsProps {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}

export function PlaybackControls({
  isReady,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between font-mono text-sm tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <span className="text-muted-foreground">{formatTime(duration)}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!isReady}
          onClick={isPlaying ? onPause : onPlay}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!isReady}
          onClick={() => onSeek(60)}
        >
          Seek to 1:00
        </Button>
      </div>
    </div>
  );
}
