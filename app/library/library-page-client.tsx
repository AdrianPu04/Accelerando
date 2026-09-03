"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CatalogWorkRow } from "@/components/catalog-work-row";
import { EmptyPanel } from "@/components/status-panel";
import { buttonVariants } from "@/components/ui/button";
import { filterCatalogWorks } from "@/lib/catalog/search";
import type { CatalogWork } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2",
            )}
          >
            Accelerando
          </Link>
          <Link
            href="/history"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground",
            )}
          >
            History
          </Link>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Browse
          </p>
          <h1 className="font-heading text-4xl font-semibold">Library</h1>
          <p className="max-w-xl text-muted-foreground">
            {works.length.toLocaleString()} works from{" "}
            <a
              href="https://openopus.org"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Open Opus
            </a>
            . Guided listening is available for curated recordings; everything
            else is catalog metadata you can explore.
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <label className="sr-only" htmlFor="catalog-search">
          Search catalog
        </label>
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, composer, genre…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <select
            aria-label="Filter by era"
            value={era}
            onChange={(event) => setEra(event.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All composers</option>
            {composers.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={recommendedOnly}
            onChange={(event) => setRecommendedOnly(event.target.checked)}
          />
          Popular & essential only
        </label>

        <p className="text-xs text-muted-foreground">
          {
            works.filter((work) => playableByOpenOpusId[work.openOpusWorkId])
              .length
          }{" "}
          works currently have an attached YouTube recording for guided
          listening.
        </p>
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {results.length.toLocaleString()} works
        </p>

        {results.length === 0 ? (
          <EmptyPanel
            title="No works match"
            description="Try a broader search, or clear era/genre filters."
          />
        ) : (
          <div>
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
    </div>
  );
}
