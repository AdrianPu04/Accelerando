import type { Metadata } from "next";

import { LibraryPageClient } from "@/app/library/library-page-client";
import {
  getAllCatalogWorks,
  getCatalogComposers,
  getCatalogEras,
  getCatalogGenres,
} from "@/lib/catalog";
import { isCatalogWorkPlayable } from "@/lib/catalog/types";
import { getAllPieces } from "@/lib/pieces";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Browse classical works from Open Opus — filter by era, genre, and composer.",
};

export default function LibraryPage() {
  const works = getAllCatalogWorks();

  const playableByOpenOpusId: Record<string, string> = {};

  for (const piece of getAllPieces()) {
    if (piece.openOpusWorkId) {
      playableByOpenOpusId[piece.openOpusWorkId] = piece.id;
    }
  }

  for (const work of works) {
    if (isCatalogWorkPlayable(work)) {
      playableByOpenOpusId[work.openOpusWorkId] = work.id;
    }
  }

  return (
    <LibraryPageClient
      works={works}
      eras={getCatalogEras()}
      genres={getCatalogGenres()}
      composers={getCatalogComposers()}
      playableByOpenOpusId={playableByOpenOpusId}
    />
  );
}
