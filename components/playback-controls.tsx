"use client";

import { PauseIcon, PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

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
    <Button
      type="button"
      size="sm"
      disabled={!isReady}
      onClick={isPlaying ? onPause : onPlay}
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
      {isPlaying ? "Pause" : "Play"}
    </Button>
  );
}
