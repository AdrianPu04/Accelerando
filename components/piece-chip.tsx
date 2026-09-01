import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
        "group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant="secondary">{piece.era}</Badge>
          <p className="font-heading text-base font-semibold tracking-wide">
            {piece.composer}
          </p>
          <p className="text-sm text-muted-foreground">{piece.title}</p>
          {piece.movement ? (
            <p className="text-xs text-muted-foreground">{piece.movement}</p>
          ) : null}
        </div>
        <span
          className={cn(
            buttonVariants({ size: "xs", variant: "outline" }),
            "shrink-0",
          )}
        >
          {actionLabel}
        </span>
      </div>
    </Link>
  );
}
