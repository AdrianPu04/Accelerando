import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className={cn("border-dashed", className)} aria-live="polite">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          Working…
        </div>
      </CardContent>
    </Card>
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
    <Card
      className={cn("border-destructive/30 bg-destructive/5", className)}
      role="alert"
    >
      <CardHeader>
        <CardTitle className="text-base text-destructive">{title}</CardTitle>
        <CardDescription className="text-destructive/90">
          {description}
        </CardDescription>
      </CardHeader>
      {onRetry ? (
        <CardFooter>
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
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
    <Card className={cn("border-dashed", className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action ? <CardFooter>{action}</CardFooter> : null}
    </Card>
  );
}
