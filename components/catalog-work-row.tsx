import Link from "next/link";

import { cn } from "@/lib/utils";
import type { CatalogWork } from "@/lib/catalog/types";

interface CatalogWorkRowProps {
  work: CatalogWork;
  playablePieceId?: string;
}

export function CatalogWorkRow({ work, playablePieceId }: CatalogWorkRowProps) {
  const href = playablePieceId
    ? `/listen/${playablePieceId}`
    : `/piece/${work.id}`;
  const actionLabel = playablePieceId ? "Listen" : "Details";

  const meta = [work.composer, work.era, work.genre].filter(Boolean).join(" · ");

  return (
    <Link
      href={href}
      className={cn(
        "group grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border py-4 transition-colors hover:border-foreground/40",
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="truncate text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
          {meta}
        </p>
        <p className="font-heading text-lg font-semibold tracking-tight text-balance">
          {work.title}
        </p>
        {work.subtitle ? (
          <p className="truncate text-sm text-muted-foreground">{work.subtitle}</p>
        ) : null}
      </div>
      <span className="pb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors group-hover:text-foreground">
        {actionLabel}
      </span>
    </Link>
  );
}
