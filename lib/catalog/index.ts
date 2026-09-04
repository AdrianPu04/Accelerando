import "server-only";

import catalogJson from "@/data/catalog.json";

import { filterCatalogWorks } from "@/lib/catalog/search";
import {
  catalogFileSchema,
  type CatalogWork,
} from "@/lib/catalog/types";

export type { CatalogFilters } from "@/lib/catalog/search";

const catalog = catalogFileSchema.parse(catalogJson);

export function getAllCatalogWorks(): CatalogWork[] {
  return catalog.works;
}

export function getCatalogWorkById(id: string): CatalogWork | undefined {
  return getAllCatalogWorks().find((work) => work.id === id);
}

export function getCatalogEras(): string[] {
  return [...new Set(getAllCatalogWorks().map((work) => work.era))].sort();
}

export function getCatalogGenres(): string[] {
  return [...new Set(getAllCatalogWorks().map((work) => work.genre))].sort();
}

export function getCatalogComposers(): string[] {
  return [
    ...new Set(getAllCatalogWorks().map((work) => work.composer)),
  ].sort((a, b) => a.localeCompare(b));
}

export function searchCatalog(
  filters: Parameters<typeof filterCatalogWorks>[1] = {},
): CatalogWork[] {
  return filterCatalogWorks(getAllCatalogWorks(), filters);
}
