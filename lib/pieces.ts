import { getAllCatalogWorks, getCatalogWorkById } from "@/lib/catalog";
import { catalogWorkToPiece } from "@/lib/catalog/to-piece";
import { isCatalogWorkPlayable } from "@/lib/catalog/types";
import type { Piece } from "@/types";

/**
 * Curated playable library — each piece maps to one specific YouTube recording.
 * Annotation timestamps are relative to that recording, not the work in general.
 *
 * openOpusWorkId links a recording to the broader OpenOpus catalog when known.
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

export function getCuratedPieceById(id: string): Piece | undefined {
  return PIECES.find((piece) => piece.id === id);
}

/** Curated recordings only (home "Start listening"). */
export function getAllPieces(): Piece[] {
  return PIECES;
}

/** Curated + OpenOpus catalog works that have an attached YouTube recording. */
export function getAllPlayablePieces(): Piece[] {
  const curatedIds = new Set(PIECES.map((piece) => piece.id));
  const fromCatalog = getAllCatalogWorks()
    .filter(isCatalogWorkPlayable)
    .map(catalogWorkToPiece)
    .filter((piece): piece is Piece => piece !== null)
    .filter((piece) => !curatedIds.has(piece.id));

  return [...PIECES, ...fromCatalog];
}

export function getPieceById(id: string): Piece | undefined {
  const curated = getCuratedPieceById(id);
  if (curated) {
    return curated;
  }

  const catalogWork = getCatalogWorkById(id);
  if (!catalogWork) {
    return undefined;
  }

  return catalogWorkToPiece(catalogWork) ?? undefined;
}

export function getPlayablePiecesForComposer(composer: string): Piece[] {
  const needle = composer.toLowerCase();

  return getAllPlayablePieces().filter(
    (piece) =>
      piece.composer.toLowerCase() === needle ||
      piece.composer.toLowerCase().includes(needle) ||
      needle.includes(piece.composer.toLowerCase()),
  );
}

export function getPlayablePieceForOpenOpusWork(
  openOpusWorkId: string,
): Piece | undefined {
  const curated = PIECES.find((piece) => piece.openOpusWorkId === openOpusWorkId);
  if (curated) {
    return curated;
  }

  const catalogWork = getAllCatalogWorks().find(
    (work) => work.openOpusWorkId === openOpusWorkId && isCatalogWorkPlayable(work),
  );

  return catalogWork ? catalogWorkToPiece(catalogWork) ?? undefined : undefined;
}
