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
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{work.era}</Badge>
          <Badge variant="outline">{work.genre}</Badge>
          {work.recommended ? <Badge variant="outline">Essential</Badge> : null}
          {playablePieceId ? <Badge>Playable</Badge> : null}
        </div>
        <p className="font-heading text-base font-semibold tracking-wide">
          {work.composer}
        </p>
        <Link
          href={`/piece/${work.id}`}
          className="text-sm text-foreground underline-offset-4 hover:underline"
        >
          {work.title}
        </Link>
        {work.subtitle ? (
          <p className="text-xs text-muted-foreground">{work.subtitle}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2">
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
