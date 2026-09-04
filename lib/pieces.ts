import "server-only";

import { getAllCatalogWorks, getCatalogWorkById } from "@/lib/catalog";
import { catalogWorkToPiece } from "@/lib/catalog/to-piece";
import { isCatalogWorkPlayable } from "@/lib/catalog/types";
import type { Piece } from "@/types";

/** Catalog work ids featured on the home "Start here" list, in display order. */
export const HOME_START_PIECE_IDS = [
  "openopus-16124", // Beethoven — Symphony no. 7 (~42m)
  "openopus-9688", // Bach — Brandenburg Concerto no. 3 (~12m)
  "openopus-15562", // Gershwin — Rhapsody in Blue (~17m)
  "openopus-24527", // Elgar — Cello Concerto (~30m)
  "openopus-23611", // Mozart — Symphony no. 40 (~26m)
] as const;

/** Home "Start here" list from a fixed featured catalog set. */
export function getHomeStartPieces(): Piece[] {
  return HOME_START_PIECE_IDS.map((id) => getPieceById(id)).filter(
    (piece): piece is Piece => piece !== undefined,
  );
}

/** OpenOpus catalog works that have an attached YouTube recording. */
export function getAllPlayablePieces(): Piece[] {
  return getAllCatalogWorks()
    .filter(isCatalogWorkPlayable)
    .map(catalogWorkToPiece)
    .filter((piece): piece is Piece => piece !== null);
}

export function getPieceById(id: string): Piece | undefined {
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
  const catalogWork = getAllCatalogWorks().find(
    (work) => work.openOpusWorkId === openOpusWorkId && isCatalogWorkPlayable(work),
  );

  return catalogWork ? catalogWorkToPiece(catalogWork) ?? undefined : undefined;
}
