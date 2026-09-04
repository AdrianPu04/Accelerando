"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getPiecePlaybackTime, getYouTubeSeekTime } from "@/lib/youtube";
import { usePlayerStore } from "@/stores/player-store";

const YOUTUBE_IFRAME_API_URL = "https://www.youtube.com/iframe_api";
const POLL_INTERVAL_MS = 250;
const API_READY_POLL_MS = 50;
const API_READY_TIMEOUT_MS = 10_000;

let youtubeApiPromise: Promise<void> | null = null;

function isYouTubeApiReady(): boolean {
  return typeof window !== "undefined" && Boolean(window.YT?.Player);
}

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (isYouTubeApiReady()) {
    return Promise.resolve();
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const finish = () => {
        if (isYouTubeApiReady()) {
          resolve();
          return true;
        }

        return false;
      };

      if (finish()) {
        return;
      }

      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        finish();
      };

      const pollId = window.setInterval(() => {
        if (finish()) {
          window.clearInterval(pollId);
        }
      }, API_READY_POLL_MS);

      window.setTimeout(() => {
        window.clearInterval(pollId);
        if (!isYouTubeApiReady()) {
          youtubeApiPromise = null;
          reject(new Error("YouTube IFrame API failed to load"));
        }
      }, API_READY_TIMEOUT_MS);

      if (
        !document.querySelector(`script[src="${YOUTUBE_IFRAME_API_URL}"]`)
      ) {
        const script = document.createElement("script");
        script.src = YOUTUBE_IFRAME_API_URL;
        script.onerror = () => {
          window.clearInterval(pollId);
          youtubeApiPromise = null;
          reject(new Error("YouTube IFrame API script failed to load"));
        };
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

interface UseYouTubePlayerOptions {
  videoId: string;
  startOffsetSeconds?: number;
  /** Canonical piece duration; clamps timeline when the YouTube video is longer. */
  durationSeconds?: number;
}

interface UseYouTubePlayerReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isReady: boolean;
  loadError: string | null;
  retry: () => void;
  seekTo: (pieceTimestampSeconds: number) => void;
  play: () => void;
  pause: () => void;
}

export function useYouTubePlayer({
  videoId,
  startOffsetSeconds = 0,
  durationSeconds,
}: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);

  const clampPieceTime = useCallback(
    (pieceTimestampSeconds: number) => {
      if (durationSeconds == null || durationSeconds <= 0) {
        return Math.max(0, pieceTimestampSeconds);
      }

      return Math.min(durationSeconds, Math.max(0, pieceTimestampSeconds));
    },
    [durationSeconds],
  );

  const seekTo = useCallback(
    (pieceTimestampSeconds: number) => {
      const player = playerRef.current;
      if (!player?.seekTo) {
        return;
      }

      const clamped = clampPieceTime(pieceTimestampSeconds);
      player.seekTo(getYouTubeSeekTime(clamped, startOffsetSeconds), true);
      setCurrentTime(clamped);
    },
    [clampPieceTime, startOffsetSeconds, setCurrentTime],
  );

  const play = useCallback(() => {
    playerRef.current?.playVideo?.();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo?.();
  }, []);

  const retry = useCallback(() => {
    youtubeApiPromise = null;
    setLoadError(null);
    setIsReady(false);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    async function initPlayer() {
      setLoadError(null);

      try {
        await loadYouTubeIframeApi();
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "YouTube player failed to load",
          );
        }
        return;
      }

      if (cancelled || !containerRef.current) {
        return;
      }

      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            start: startOffsetSeconds > 0 ? startOffsetSeconds : undefined,
          },
          events: {
            onReady: (event) => {
              if (cancelled) {
                return;
              }

              if (startOffsetSeconds > 0) {
                event.target.seekTo(startOffsetSeconds, true);
                setCurrentTime(0);
              }

              setIsReady(true);
              setLoadError(null);

              const youtubeDuration = event.target.getDuration();
              const fromVideo = Math.max(0, youtubeDuration - startOffsetSeconds);
              const nextDuration =
                durationSeconds != null && durationSeconds > 0
                  ? Math.min(durationSeconds, fromVideo || durationSeconds)
                  : fromVideo;
              setDuration(nextDuration);
            },
            onError: () => {
              if (!cancelled) {
                setIsReady(false);
                setLoadError("This recording could not be loaded from YouTube.");
              }
            },
            onStateChange: (event) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            },
          },
        });
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "YouTube player failed to initialize",
          );
        }
        return;
      }

      intervalId = setInterval(() => {
        const player = playerRef.current;
        if (!player?.getCurrentTime) {
          return;
        }

        const pieceTime = clampPieceTime(
          getPiecePlaybackTime(player.getCurrentTime(), startOffsetSeconds),
        );
        setCurrentTime(pieceTime);

        if (
          durationSeconds != null &&
          durationSeconds > 0 &&
          pieceTime >= durationSeconds &&
          player.getPlayerState?.() === window.YT.PlayerState.PLAYING
        ) {
          player.pauseVideo?.();
          setIsPlaying(false);
        }
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
  }, [
    videoId,
    startOffsetSeconds,
    durationSeconds,
    reloadToken,
    clampPieceTime,
    setCurrentTime,
    setDuration,
    setIsPlaying,
  ]);

  return { containerRef, isReady, loadError, retry, seekTo, play, pause };
}
