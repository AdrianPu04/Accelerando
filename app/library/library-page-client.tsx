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
  "w-full border-0 border-b border-input bg-transparent px-0 py-2 text-sm outline-none transition-colors focus-visible:border-foreground";

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

  const playableCount = Object.keys(playableByOpenOpusId).length;

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
            Open Opus catalog · {playableCount.toLocaleString()} playable in
            current results
          </p>
        </div>
      </header>

      <section className="grid gap-x-6 gap-y-3 border-b border-border pb-6 sm:grid-cols-2 lg:grid-cols-4">
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
          {total.toLocaleString()} works
          {isPending ? " · updating…" : ""}
        </p>

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
            description="Try a broader search, or clear era/genre filters."
          />
        ) : null}

        {!error && works.length > 0 ? (
          <div>
            <div className="mb-1 hidden grid-cols-[10rem_minmax(0,1fr)_8rem_7rem_9rem] gap-4 border-b border-border pb-2 text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase lg:grid">
              <span>Composer</span>
              <span>Title</span>
              <span>Era</span>
              <span>Genre</span>
              <span className="text-right"> </span>
            </div>
            {works.map((work) => (
              <CatalogWorkRow
                key={work.id}
                work={work}
                playablePieceId={playableByOpenOpusId[work.openOpusWorkId]}
              />
            ))}
            {total > works.length ? (
              <p className="py-4 text-sm text-muted-foreground">
                Showing first {works.length.toLocaleString()} of{" "}
                {total.toLocaleString()}. Refine your search to narrow results.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
