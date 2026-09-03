import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Piece } from "@/types";

interface PieceChipProps {
  piece: Piece;
  actionLabel?: string;
  className?: string;
}

export function PieceChip({
  piece,
  actionLabel = "Listen",
  className,
}: PieceChipProps) {
  return (
    <Link
      href={`/listen/${piece.id}`}
      className={cn(
        "group grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border py-4 transition-colors hover:border-foreground/40",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
          {piece.composer}
          <span className="mx-2 text-border">·</span>
          {piece.era}
        </p>
        <p className="font-heading text-lg font-semibold tracking-tight text-balance">
          {piece.title}
        </p>
        {piece.movement ? (
          <p className="truncate text-sm text-muted-foreground">{piece.movement}</p>
        ) : null}
      </div>
      <span className="pb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors group-hover:text-foreground">
        {actionLabel}
      </span>
    </Link>
  );
}
