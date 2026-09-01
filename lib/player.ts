import { getPieceById } from "@/lib/pieces";
import { beginListeningToPiece } from "@/lib/listening-storage";
import { usePlayerStore } from "@/stores/player-store";
import type { Piece } from "@/types";

export function startPieceSession(pieceId: string): Piece {
  const piece = getPieceById(pieceId);

  if (!piece) {
    throw new Error(`Unknown piece: ${pieceId}`);
  }

  const store = usePlayerStore.getState();
  store.reset();
  store.setPiece(pieceId);

  return piece;
}

/** Clear any in-progress session so the listen page starts fresh. */
export function prepareRecommendedPiece(pieceId: string): void {
  beginListeningToPiece(pieceId);
}
