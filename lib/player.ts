import { usePlayerStore } from "@/stores/player-store";

const CURRENT_SESSION_PREFIX = "accelerando:current-session:";

/** Reset playback state for a piece. Piece metadata comes from the listen page. */
export function startPieceSession(pieceId: string): void {
  const store = usePlayerStore.getState();
  store.reset();
  store.setPiece(pieceId);
}

/** Clear any in-progress session so the listen page starts fresh. */
export function prepareRecommendedPiece(pieceId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(`${CURRENT_SESSION_PREFIX}${pieceId}`);
}
