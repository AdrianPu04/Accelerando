import { getPieceById } from "@/lib/pieces";
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
