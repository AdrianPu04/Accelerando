"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card aria-live="polite">
      <CardHeader>
        <CardTitle>Why this piece</CardTitle>
        {isStreaming ? (
          <CardDescription>Writing your recommendation…</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
      </CardContent>
    </Card>
  );
}
