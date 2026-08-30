import type { YouTubePlayer } from "youtube";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type YouTubePlayerInstance = YouTubePlayer;
