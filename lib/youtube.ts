const YOUTUBE_VIDEO_ID_PATTERN = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function parseYouTubeVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_VIDEO_ID_PATTERN);
  return match?.[1] ?? null;
}

/** Playback time relative to the piece, not the raw YouTube timestamp. */
export function getPiecePlaybackTime(
  youtubeCurrentTime: number,
  startOffsetSeconds: number,
): number {
  return Math.max(0, youtubeCurrentTime - startOffsetSeconds);
}

/** YouTube seek target for a piece-relative timestamp. */
export function getYouTubeSeekTime(
  pieceTimestampSeconds: number,
  startOffsetSeconds: number,
): number {
  return startOffsetSeconds + pieceTimestampSeconds;
}
