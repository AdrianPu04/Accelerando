"use client";

import { useYouTubePlayer } from "@/hooks/use-youtube-player";
import { usePlayerStore } from "@/stores/player-store";
import type { Piece } from "@/types";

export function useAudioPlayer(piece: Piece) {
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
