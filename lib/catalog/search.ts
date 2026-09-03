import type { CatalogWork } from "@/lib/catalog/types";

export interface CatalogFilters {
  query?: string;
  era?: string;
  genre?: string;
  composer?: string;
  recommendedOnly?: boolean;
}

export function filterCatalogWorks(
  works: CatalogWork[],
  filters: CatalogFilters = {},
): CatalogWork[] {
  const query = filters.query?.trim().toLowerCase() ?? "";

  return works.filter((work) => {
    if (filters.era && work.era !== filters.era) {
      return false;
    }

    if (filters.genre && work.genre !== filters.genre) {
      return false;
    }

    if (filters.composer && work.composer !== filters.composer) {
      return false;
    }

    if (filters.recommendedOnly && !work.recommended && !work.popular) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      work.title,
      work.subtitle ?? "",
      work.composer,
      work.composerCompleteName,
      work.era,
      work.genre,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
