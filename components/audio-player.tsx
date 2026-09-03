import type { RefObject } from "react";

import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  containerRef: RefObject<HTMLDivElement | null>;
  isReady?: boolean;
  className?: string;
}

export function AudioPlayer({
  containerRef,
  isReady = false,
  className,
}: AudioPlayerProps) {
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-black",
        className,
      )}
    >
      <div ref={containerRef} className="h-full w-full" />
      {!isReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-sm text-muted-foreground">
          Loading player...
        </div>
      ) : null}
    </div>
  );
}
