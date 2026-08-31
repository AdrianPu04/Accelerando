"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getPiecePlaybackTime, getYouTubeSeekTime } from "@/lib/youtube";
import { usePlayerStore } from "@/stores/player-store";

const YOUTUBE_IFRAME_API_URL = "https://www.youtube.com/iframe_api";
const POLL_INTERVAL_MS = 250;

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      if (
        !document.querySelector(`script[src="${YOUTUBE_IFRAME_API_URL}"]`)
      ) {
        const script = document.createElement("script");
        script.src = YOUTUBE_IFRAME_API_URL;
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

export interface UseYouTubePlayerOptions {
  videoId: string;
  startOffsetSeconds?: number;
}

export interface UseYouTubePlayerReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isReady: boolean;
  seekTo: (pieceTimestampSeconds: number) => void;
  play: () => void;
  pause: () => void;
}

export function useYouTubePlayer({
  videoId,
  startOffsetSeconds = 0,
}: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);

  const seekTo = useCallback(
    (pieceTimestampSeconds: number) => {
      const player = playerRef.current;
      if (!player?.seekTo) {
        return;
      }

      player.seekTo(
        getYouTubeSeekTime(pieceTimestampSeconds, startOffsetSeconds),
        true,
      );
      setCurrentTime(pieceTimestampSeconds);
    },
    [startOffsetSeconds, setCurrentTime],
  );

  const play = useCallback(() => {
    playerRef.current?.playVideo?.();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo?.();
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    async function initPlayer() {
      await loadYouTubeIframeApi();

      if (cancelled || !containerRef.current) {
        return;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            if (cancelled) {
              return;
            }

            setIsReady(true);

            const youtubeDuration = event.target.getDuration();
            setDuration(Math.max(0, youtubeDuration - startOffsetSeconds));
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });

      intervalId = setInterval(() => {
        const player = playerRef.current;
        if (!player?.getCurrentTime) {
          return;
        }

        const pieceTime = getPiecePlaybackTime(
          player.getCurrentTime(),
          startOffsetSeconds,
        );
        setCurrentTime(pieceTime);
      }, POLL_INTERVAL_MS);
    }

    void initPlayer();

    return () => {
      cancelled = true;

      if (intervalId) {
        clearInterval(intervalId);
      }

      playerRef.current?.destroy?.();
      playerRef.current = null;
      setIsReady(false);
    };
  }, [videoId, startOffsetSeconds, setCurrentTime, setDuration, setIsPlaying]);

  return { containerRef, isReady, seekTo, play, pause };
}
