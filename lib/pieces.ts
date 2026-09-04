import "server-only";

import {
  getAllCuratedPieces,
  getCuratedPieceById,
} from "@/lib/curated-pieces";
import { getAllCatalogWorks, getCatalogWorkById } from "@/lib/catalog";
import { catalogWorkToPiece } from "@/lib/catalog/to-piece";
import { isCatalogWorkPlayable } from "@/lib/catalog/types";
import type { Piece } from "@/types";

export {
  CURATED_PIECES as PIECES,
  getAllCuratedPieces,
  getCuratedPieceById,
} from "@/lib/curated-pieces";

/** Catalog work ids featured on the home "Start here" list, in display order. */
export const HOME_START_PIECE_IDS = [
  "beethoven-7-i", // Beethoven — Symphony no. 7 (complete)
  "openopus-9688", // Bach — Brandenburg Concerto no. 3 (~12m)
  "openopus-15562", // Gershwin — Rhapsody in Blue (~17m)
  "openopus-24527", // Elgar — Cello Concerto (~30m)
  "mozart-40-i", // Mozart — Symphony no. 40 (complete)
] as const;

/** Curated recordings only (legacy starters / static params). */
export function getAllPieces(): Piece[] {
  return getAllCuratedPieces();
}

/** Home "Start here" list from a fixed featured set. */
export function getHomeStartPieces(): Piece[] {
  return HOME_START_PIECE_IDS.map((id) => getPieceById(id)).filter(
    (piece): piece is Piece => piece !== undefined,
  );
}

/** Curated + OpenOpus catalog works that have an attached YouTube recording. */
export function getAllPlayablePieces(): Piece[] {
  const curatedIds = new Set(getAllCuratedPieces().map((piece) => piece.id));
  const fromCatalog = getAllCatalogWorks()
    .filter(isCatalogWorkPlayable)
    .map(catalogWorkToPiece)
    .filter((piece): piece is Piece => piece !== null)
    .filter((piece) => !curatedIds.has(piece.id));

  return [...getAllCuratedPieces(), ...fromCatalog];
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
  const curated = getAllCuratedPieces().find(
    (piece) => piece.openOpusWorkId === openOpusWorkId,
  );
  if (curated) {
    return curated;
  }

  const catalogWork = getAllCatalogWorks().find(
    (work) => work.openOpusWorkId === openOpusWorkId && isCatalogWorkPlayable(work),
  );

  return catalogWork ? catalogWorkToPiece(catalogWork) ?? undefined : undefined;
}
