"use client";

import { useEffect, useState, useTransition } from "react";

import { AppShell } from "@/components/app-shell";
import { CatalogWorkRow } from "@/components/catalog-work-row";
import { EmptyPanel, LoadingPanel } from "@/components/status-panel";
import type { CatalogWork } from "@/lib/catalog/types";

interface LibraryPageClientProps {
  initialWorks: CatalogWork[];
  initialTotal: number;
  eras: string[];
  genres: string[];
  composers: string[];
  initialPlayableByOpenOpusId: Record<string, string>;
}

const fieldClassName =
  "w-full appearance-none border-0 border-b border-input bg-transparent px-0 py-2.5 text-sm outline-none transition-colors focus-visible:border-foreground";

interface CatalogSearchResponse {
  total: number;
  works: CatalogWork[];
  playableByOpenOpusId: Record<string, string>;
}

export function LibraryPageClient({
  initialWorks,
  initialTotal,
  eras,
  genres,
  composers,
  initialPlayableByOpenOpusId,
}: LibraryPageClientProps) {
  const [query, setQuery] = useState("");
  const [era, setEra] = useState("");
  const [genre, setGenre] = useState("");
  const [composer, setComposer] = useState("");
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [works, setWorks] = useState(initialWorks);
  const [total, setTotal] = useState(initialTotal);
  const [playableByOpenOpusId, setPlayableByOpenOpusId] = useState(
    initialPlayableByOpenOpusId,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasFilters = Boolean(
    query.trim() || era || genre || composer || recommendedOnly,
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const params = new URLSearchParams();
          if (query.trim()) {
            params.set("q", query.trim());
          }
          if (era) {
            params.set("era", era);
          }
          if (genre) {
            params.set("genre", genre);
          }
          if (composer) {
            params.set("composer", composer);
          }
          if (recommendedOnly) {
            params.set("recommendedOnly", "1");
          }
          params.set("limit", "100");

          const response = await fetch(`/api/catalog/search?${params}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Search failed (${response.status})`);
          }

          const data = (await response.json()) as CatalogSearchResponse;
          setWorks(data.works);
          setTotal(data.total);
          setPlayableByOpenOpusId(data.playableByOpenOpusId);
          setError(null);
        } catch (searchError) {
          if (controller.signal.aborted) {
            return;
          }

          console.error("Catalog search failed:", searchError);
          setError("Could not refresh results. Try again.");
        }
      });
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [composer, era, genre, query, recommendedOnly]);

  function clearFilters() {
    setQuery("");
    setEra("");
    setGenre("");
    setComposer("");
    setRecommendedOnly(false);
  }

  return (
    <AppShell>
      <header className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Browse
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Library
        </h1>
        <p className="text-muted-foreground">
          Search the Open Opus catalog, then open a recording with guided
          annotations.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-6 lg:sticky lg:top-8">
          <div className="space-y-1">
            <label
              htmlFor="catalog-search"
              className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
            >
              Search
            </label>
            <input
              id="catalog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, composer, genre…"
              className={fieldClassName}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            <div className="space-y-1">
              <label
                htmlFor="catalog-era"
                className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
              >
                Era
              </label>
              <select
                id="catalog-era"
                aria-label="Filter by era"
                value={era}
                onChange={(event) => setEra(event.target.value)}
                className={fieldClassName}
              >
                <option value="">All</option>
                {eras.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="catalog-genre"
                className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
              >
                Genre
              </label>
              <select
                id="catalog-genre"
                aria-label="Filter by genre"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
                className={fieldClassName}
              >
                <option value="">All</option>
                {genres.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="catalog-composer"
                className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
              >
                Composer
              </label>
              <select
                id="catalog-composer"
                aria-label="Filter by composer"
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                className={fieldClassName}
              >
                <option value="">All</option>
                {composers.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={recommendedOnly}
              onChange={(event) => setRecommendedOnly(event.target.checked)}
            />
            Popular & essential only
          </label>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Clear filters
            </button>
          ) : null}
        </aside>

        <section className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {total.toLocaleString()} works
              {isPending ? " · updating" : ""}
            </p>
            {works.length > 0 && total > works.length ? (
              <p className="text-xs text-muted-foreground">
                Showing {works.length.toLocaleString()}
              </p>
            ) : null}
          </div>

          {error ? (
            <EmptyPanel title="Search unavailable" description={error} />
          ) : null}

          {!error && isPending && works.length === 0 ? (
            <LoadingPanel
              title="Searching catalog"
              description="Filtering works…"
            />
          ) : null}

          {!error && works.length === 0 && !isPending ? (
            <EmptyPanel
              title="No works match"
              description="Try a broader search, or clear filters."
            />
          ) : null}

          {!error && works.length > 0 ? (
            <div>
              {works.map((work) => (
                <CatalogWorkRow
                  key={work.id}
                  work={work}
                  playablePieceId={playableByOpenOpusId[work.openOpusWorkId]}
                />
              ))}
              {total > works.length ? (
                <p className="py-5 text-sm text-muted-foreground">
                  Refine your search to narrow the remaining{" "}
                  {(total - works.length).toLocaleString()} works.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
