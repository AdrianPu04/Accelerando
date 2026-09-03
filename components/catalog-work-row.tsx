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
    <div className="grid grid-cols-[10rem_minmax(0,1fr)_8rem_7rem_9rem] items-baseline gap-4 border-b border-border py-3 text-sm last:border-b-0">
      <p className="truncate font-heading font-semibold tracking-tight">
        {work.composer}
      </p>

      <div className="min-w-0">
        <Link
          href={`/piece/${work.id}`}
          className="truncate text-foreground underline-offset-4 hover:underline"
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
      </div>

      <span className="truncate text-muted-foreground">{work.era}</span>
      <span className="truncate text-muted-foreground">{work.genre}</span>

      <div className="flex justify-end gap-3">
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
