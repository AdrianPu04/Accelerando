import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingPanelProps {
  title: string;
  description?: string;
  className?: string;
}

export function LoadingPanel({
  title,
  description,
  className,
}: LoadingPanelProps) {
  return (
    <div
      className={cn("space-y-2 border-y border-dashed border-border py-5", className)}
      aria-live="polite"
    >
      <p className="font-heading text-lg font-semibold tracking-tight">{title}</p>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        Working…
      </div>
    </div>
  );
}

interface ErrorPanelProps {
  title: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorPanel({
  title,
  description,
  onRetry,
  retryLabel = "Retry",
  className,
}: ErrorPanelProps) {
  return (
    <div
      className={cn("space-y-3 border-y border-destructive/30 py-5", className)}
      role="alert"
    >
      <p className="font-heading text-lg font-semibold tracking-tight text-destructive">
        {title}
      </p>
      <p className="text-sm text-destructive/90">{description}</p>
      {onRetry ? (
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

interface EmptyPanelProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyPanel({
  title,
  description,
  action,
  className,
}: EmptyPanelProps) {
  return (
    <div
      className={cn("space-y-3 border-y border-dashed border-border py-5", className)}
    >
      <p className="font-heading text-lg font-semibold tracking-tight">{title}</p>
      <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
