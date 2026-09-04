"use client";

import type { Piece } from "@/types";

export async function fetchPieceById(pieceId: string): Promise<Piece | null> {
  const response = await fetch(`/api/pieces/${encodeURIComponent(pieceId)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load piece (${response.status})`);
  }

  return (await response.json()) as Piece;
}
