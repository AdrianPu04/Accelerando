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
