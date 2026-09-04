import type { Piece } from "@/types";

/**
 * Curated playable library — each piece maps to one specific YouTube recording.
 * Safe for client imports (does not pull catalog.json).
 */
/**
 * Movement-length starter recordings featured on home.
 * Linked to OpenOpus works so /piece and library can resolve them.
 */
export const CURATED_PIECES: Piece[] = [
  {
    id: "beethoven-7-i",
    title: "Symphony No. 7 in A major, Op. 92",
    composer: "Beethoven",
    movement: "I. Poco sostenuto – Vivace",
    era: "Romantic",
    youtubeVideoId: "W5NsPOgyALI",
    startOffsetSeconds: 0,
    durationSeconds: 811,
    openOpusWorkId: "16124",
  },
  {
    id: "mozart-40-i",
    title: "Symphony No. 40 in G minor, K. 550",
    composer: "Mozart",
    movement: "I. Molto allegro",
    era: "Classical",
    youtubeVideoId: "z_4jMxbwmVc",
    startOffsetSeconds: 0,
    durationSeconds: 470,
    openOpusWorkId: "23611",
  },
];

export function getCuratedPieceById(id: string): Piece | undefined {
  return CURATED_PIECES.find((piece) => piece.id === id);
}

export function getAllCuratedPieces(): Piece[] {
  return CURATED_PIECES;
}
