"use client";

import type { RefObject } from "react";

import { useYouTubePlayer } from "@/hooks/use-youtube-player";
import { usePlayerStore } from "@/stores/player-store";
import type { Piece } from "@/types";

export interface AudioPlayerControls {
  containerRef: RefObject<HTMLDivElement | null>;
  isReady: boolean;
  loadError: string | null;
  retry: () => void;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  seekTo: (pieceTimestampSeconds: number) => void;
  play: () => void;
  pause: () => void;
}

export function useAudioPlayer(piece: Piece): AudioPlayerControls {
  const { containerRef, isReady, loadError, retry, seekTo, play, pause } =
    useYouTubePlayer({
      videoId: piece.youtubeVideoId,
      startOffsetSeconds: piece.startOffsetSeconds,
      durationSeconds: piece.durationSeconds,
    });

  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const effectiveDuration =
    duration > 0
      ? Math.min(duration, piece.durationSeconds)
      : piece.durationSeconds;

  return {
    containerRef,
    isReady,
    loadError,
    retry,
    currentTime: Math.min(currentTime, effectiveDuration),
    duration: effectiveDuration,
    isPlaying,
    seekTo,
    play,
    pause,
  };
}
