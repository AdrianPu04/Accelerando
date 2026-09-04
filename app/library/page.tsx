import type { Metadata } from "next";

import { LibraryPageClient } from "@/app/library/library-page-client";
import {
  getCatalogComposers,
  getCatalogEras,
  getCatalogGenres,
  searchCatalog,
} from "@/lib/catalog";
import { isCatalogWorkPlayable } from "@/lib/catalog/types";
import { getAllPieces } from "@/lib/pieces";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Browse classical works from Open Opus — filter by era, genre, and composer.",
};

const INITIAL_LIMIT = 100;

export default function LibraryPage() {
  const matched = searchCatalog({});
  const initialWorks = matched.slice(0, INITIAL_LIMIT);
  const total = matched.length;

  const playableByOpenOpusId: Record<string, string> = {};

  for (const work of initialWorks) {
    if (isCatalogWorkPlayable(work)) {
      playableByOpenOpusId[work.openOpusWorkId] = work.id;
    }
  }

  // Prefer curated movement recordings when linked to an OpenOpus work.
  for (const piece of getAllPieces()) {
    if (piece.openOpusWorkId) {
      playableByOpenOpusId[piece.openOpusWorkId] = piece.id;
    }
  }

  return (
    <LibraryPageClient
      initialWorks={initialWorks}
      initialTotal={total}
      eras={getCatalogEras()}
      genres={getCatalogGenres()}
      composers={getCatalogComposers()}
      initialPlayableByOpenOpusId={playableByOpenOpusId}
    />
  );
}
