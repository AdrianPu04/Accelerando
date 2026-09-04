import type { Piece } from "@/types";

/**
 * Curated complete-symphony starters featured on home.
 * Linked to OpenOpus works so /piece and library can resolve them.
 * IDs keep a legacy `-i` suffix for stable listen URLs.
 */
export const CURATED_PIECES: Piece[] = [
  {
    id: "beethoven-7-i",
    title: "Symphony No. 7 in A major, Op. 92",
    composer: "Beethoven",
    movement: "Complete symphony",
    era: "Romantic",
    youtubeVideoId: "W5NsPOgyALI",
    startOffsetSeconds: 0,
    durationSeconds: 2512,
    openOpusWorkId: "16124",
  },
  {
    id: "mozart-40-i",
    title: "Symphony No. 40 in G minor, K. 550",
    composer: "Mozart",
    movement: "Complete symphony",
    era: "Classical",
    youtubeVideoId: "z_4jMxbwmVc",
    startOffsetSeconds: 0,
    durationSeconds: 1585,
    openOpusWorkId: "23611",
  },
];

export function getCuratedPieceById(id: string): Piece | undefined {
  return CURATED_PIECES.find((piece) => piece.id === id);
}

export function getAllCuratedPieces(): Piece[] {
  return CURATED_PIECES;
}
