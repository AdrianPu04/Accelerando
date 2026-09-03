import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CatalogWork } from "@/lib/catalog/types";

interface CatalogWorkRowProps {
  work: CatalogWork;
  playablePieceId?: string;
}

export function CatalogWorkRow({ work, playablePieceId }: CatalogWorkRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)_7rem_6rem_8rem] items-center gap-3 border-b border-border py-2.5 text-sm last:border-b-0">
      <p className="truncate font-heading font-semibold tracking-wide">
        {work.composer}
      </p>

      <div className="min-w-0">
        <Link
          href={`/piece/${work.id}`}
          className="block truncate text-foreground underline-offset-4 hover:underline"
        >
          {work.title}
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {work.recommended ? (
            <Badge variant="outline">Essential</Badge>
          ) : null}
          {playablePieceId ? <Badge>Playable</Badge> : null}
        </div>
      </div>

      <span className="truncate text-muted-foreground">{work.era}</span>
      <span className="truncate text-muted-foreground">{work.genre}</span>

      <div className="flex justify-end gap-2">
        <Link
          href={`/piece/${work.id}`}
          className={cn(buttonVariants({ size: "xs", variant: "outline" }))}
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
