import type { Piece } from "@/types";

/**
 * Curated library — each piece maps to one specific YouTube recording.
 * Annotation timestamps are relative to that recording, not the work in general.
 */
export const PIECES: Piece[] = [
  {
    id: "beethoven-7-i",
    title: "Symphony No. 7 in A major, Op. 92",
    composer: "Beethoven",
    movement: "I. Poco sostenuto – Vivace",
    era: "Romantic",
    youtubeVideoId: "W5NsPOgyALI",
    startOffsetSeconds: 0,
    durationSeconds: 811,
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
  },
];

export function getPieceById(id: string): Piece | undefined {
  return PIECES.find((piece) => piece.id === id);
}

export function getAllPieces(): Piece[] {
  return PIECES;
}
