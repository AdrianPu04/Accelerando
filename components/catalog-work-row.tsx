import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CatalogWork } from "@/lib/catalog/types";

interface CatalogWorkRowProps {
  work: CatalogWork;
  playablePieceId?: string;
}

export function CatalogWorkRow({ work, playablePieceId }: CatalogWorkRowProps) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-border py-3 text-sm last:border-b-0 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4 lg:grid-cols-[10rem_minmax(0,1fr)_8rem_7rem_9rem]">
      <p className="truncate font-heading font-semibold tracking-tight">
        {work.composer}
      </p>

      <div className="min-w-0 sm:col-span-1 lg:col-span-1">
        <Link
          href={`/piece/${work.id}`}
          className="text-foreground underline-offset-4 hover:underline"
        >
          {work.title}
        </Link>
        {(work.recommended || playablePieceId) && (
          <p className="mt-0.5 text-[0.65rem] tracking-widest text-muted-foreground uppercase">
            {[
              work.recommended ? "Essential" : null,
              playablePieceId ? "Playable" : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground lg:hidden">
          {[work.era, work.genre].filter(Boolean).join(" · ")}
        </p>
      </div>

      <span className="hidden truncate text-muted-foreground lg:block">
        {work.era}
      </span>
      <span className="hidden truncate text-muted-foreground lg:block">
        {work.genre}
      </span>

      <div className="flex gap-3 sm:justify-end">
        <Link
          href={`/piece/${work.id}`}
          className="text-xs font-semibold tracking-widest text-muted-foreground uppercase hover:text-foreground"
        >
          Details
        </Link>
        {playablePieceId ? (
          <Link
            href={`/listen/${playablePieceId}`}
            className={cn(buttonVariants({ size: "xs" }))}
          >
            Listen
          </Link>
        ) : null}
      </div>
    </div>
  );
}
