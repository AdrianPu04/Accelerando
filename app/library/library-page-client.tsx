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
      <header className="flex items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Browse
          </p>
          <h1 className="font-heading text-4xl font-semibold">Library</h1>
          <p className="max-w-2xl text-muted-foreground">
            {works.length.toLocaleString()} works from{" "}
            <a
              href="https://openopus.org"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Open Opus
            </a>
            . {playableCount.toLocaleString()} have attached recordings for
            guided listening.
          </p>
        </div>
      </header>

      <section className="grid gap-3 border-b border-border pb-6 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_auto] lg:items-center">
        <label className="sr-only" htmlFor="catalog-search">
          Search catalog
        </label>
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, composer, genre…"
          className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <select
          aria-label="Filter by era"
          value={era}
          onChange={(event) => setEra(event.target.value)}
          className="border border-input bg-background px-3 py-2 text-sm"
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
          className="border border-input bg-background px-3 py-2 text-sm"
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
          className="border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All composers</option>
          {composers.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={recommendedOnly}
            onChange={(event) => setRecommendedOnly(event.target.checked)}
          />
          Popular & essential
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
            <div className="mb-1 grid grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)_7rem_6rem_8rem] gap-3 border-b border-border pb-2 text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
              <span>Composer</span>
              <span>Title</span>
              <span>Era</span>
              <span>Genre</span>
              <span className="text-right">Actions</span>
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
