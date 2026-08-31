"use client";

import type { RefObject } from "react";

import { useYouTubePlayer } from "@/hooks/use-youtube-player";
import { usePlayerStore } from "@/stores/player-store";
import type { Piece } from "@/types";

export interface AudioPlayerControls {
  containerRef: RefObject<HTMLDivElement | null>;
  isReady: boolean;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  seekTo: (pieceTimestampSeconds: number) => void;
  play: () => void;
  pause: () => void;
}

export function useAudioPlayer(piece: Piece): AudioPlayerControls {
  const { containerRef, isReady, seekTo, play, pause } = useYouTubePlayer({
    videoId: piece.youtubeVideoId,
    startOffsetSeconds: piece.startOffsetSeconds,
  });

  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  return {
    containerRef,
    isReady,
    currentTime,
    duration,
    isPlaying,
    seekTo,
    play,
    pause,
  };
}
