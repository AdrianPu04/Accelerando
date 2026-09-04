import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  containerRef: RefObject<HTMLDivElement | null>;
  isReady?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function AudioPlayer({
  containerRef,
  isReady = false,
  loadError = null,
  onRetry,
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
      {loadError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 px-6 text-center">
          <p className="text-sm text-muted-foreground">{loadError}</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : !isReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-sm text-muted-foreground">
          Loading player...
        </div>
      ) : null}
    </div>
  );
}
