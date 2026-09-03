"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { CatalogWorkRow } from "@/components/catalog-work-row";
import { EmptyPanel } from "@/components/status-panel";
import { filterCatalogWorks } from "@/lib/catalog/search";
import type { CatalogWork } from "@/lib/catalog/types";

interface LibraryPageClientProps {
  works: CatalogWork[];
  eras: string[];
  genres: string[];
  composers: string[];
  playableByOpenOpusId: Record<string, string>;
}

const fieldClassName =
  "w-full border-0 border-b border-input bg-transparent px-0 py-2 text-sm outline-none transition-colors focus-visible:border-foreground";

export function LibraryPageClient({
  works,
  eras,
  genres,
  composers,
  playableByOpenOpusId,
}: LibraryPageClientProps) {
  const [query, setQuery] = useState("");
  const [era, setEra] = useState("");
  const [genre, setGenre] = useState("");
  const [composer, setComposer] = useState("");
  const [recommendedOnly, setRecommendedOnly] = useState(false);

  const results = useMemo(() => {
    return filterCatalogWorks(works, {
      query,
      era: era || undefined,
      genre: genre || undefined,
      composer: composer || undefined,
      recommendedOnly,
    });
  }, [composer, era, genre, query, recommendedOnly, works]);

  const playableCount = works.filter(
    (work) => playableByOpenOpusId[work.openOpusWorkId],
  ).length;

  return (
    <AppShell>
      <header className="flex items-end justify-between gap-10">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Browse
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Library
          </h1>
          <p className="text-muted-foreground">
            {works.length.toLocaleString()} works from Open Opus ·{" "}
            {playableCount.toLocaleString()} playable
          </p>
        </div>
      </header>

      <section className="grid gap-x-6 gap-y-3 border-b border-border pb-6 lg:grid-cols-4">
        <label className="sr-only" htmlFor="catalog-search">
          Search catalog
        </label>
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, composer, genre…"
          className={fieldClassName}
        />

        <select
          aria-label="Filter by era"
          value={era}
          onChange={(event) => setEra(event.target.value)}
          className={fieldClassName}
        >
          <option value="">All eras</option>
          {eras.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by genre"
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          className={fieldClassName}
        >
          <option value="">All genres</option>
          {genres.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by composer"
          value={composer}
          onChange={(event) => setComposer(event.target.value)}
          className={fieldClassName}
        >
          <option value="">All composers</option>
          {composers.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <label className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={recommendedOnly}
            onChange={(event) => setRecommendedOnly(event.target.checked)}
          />
          Popular & essential only
        </label>
      </section>

      <section>
        <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {results.length.toLocaleString()} works
        </p>

        {results.length === 0 ? (
          <EmptyPanel
            title="No works match"
            description="Try a broader search, or clear era/genre filters."
          />
        ) : (
          <div>
            <div className="mb-1 grid grid-cols-[10rem_minmax(0,1fr)_8rem_7rem_9rem] gap-4 border-b border-border pb-2 text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
              <span>Composer</span>
              <span>Title</span>
              <span>Era</span>
              <span>Genre</span>
              <span className="text-right"> </span>
            </div>
            {results.slice(0, 100).map((work) => (
              <CatalogWorkRow
                key={work.id}
                work={work}
                playablePieceId={playableByOpenOpusId[work.openOpusWorkId]}
              />
            ))}
            {results.length > 100 ? (
              <p className="py-4 text-sm text-muted-foreground">
                Showing first 100 of {results.length.toLocaleString()}. Refine
                your search to narrow results.
              </p>
            ) : null}
          </div>
        )}
      </section>
    </AppShell>
  );
}
