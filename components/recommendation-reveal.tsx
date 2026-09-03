"use client";

import { ErrorPanel, LoadingPanel } from "@/components/status-panel";
import { formatAiError } from "@/lib/user-messages";

interface RecommendationRevealProps {
  text: string;
  isLoading?: boolean;
  isStreaming?: boolean;
  error?: string | null;
}

export function RecommendationReveal({
  text,
  isLoading = false,
  isStreaming = false,
  error = null,
}: RecommendationRevealProps) {
  if (error) {
    const formatted = formatAiError(error);

    return (
      <ErrorPanel title={formatted.title} description={formatted.description} />
    );
  }

  if (isLoading && !text) {
    return (
      <LoadingPanel
        title="Finding your next listen"
        description="Considering your reflection and what you noticed…"
      />
    );
  }

  if (!text) {
    return null;
  }

  return (
    <article className="max-w-prose space-y-3" aria-live="polite">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Why this piece
        {isStreaming ? (
          <span className="ml-2 font-normal normal-case tracking-normal">
            · writing…
          </span>
        ) : null}
      </p>
      <p className="text-base leading-[1.75] whitespace-pre-wrap">{text}</p>
    </article>
  );
}
