import { NextResponse } from "next/server";

import {
  getCatalogComposers,
  getCatalogEras,
  getCatalogGenres,
  searchCatalog,
} from "@/lib/catalog";
import { isCatalogWorkPlayable } from "@/lib/catalog/types";
import { getAllPieces } from "@/lib/pieces";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const era = searchParams.get("era") || undefined;
  const genre = searchParams.get("genre") || undefined;
  const composer = searchParams.get("composer") || undefined;
  const recommendedOnly = searchParams.get("recommendedOnly") === "1";
  const includeFacets = searchParams.get("facets") === "1";
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT),
  );

  const matched = searchCatalog({
    query,
    era,
    genre,
    composer,
    recommendedOnly,
  });

  const playableByOpenOpusId: Record<string, string> = {};

  for (const work of matched) {
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

  return NextResponse.json({
    total: matched.length,
    works: matched.slice(0, limit),
    playableByOpenOpusId,
    ...(includeFacets
      ? {
          eras: getCatalogEras(),
          genres: getCatalogGenres(),
          composers: getCatalogComposers(),
        }
      : {}),
  });
}
