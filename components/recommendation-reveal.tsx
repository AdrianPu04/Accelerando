"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    return (
      <Card>
        <CardContent className="text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (isLoading && !text) {
    return (
      <Card aria-live="polite">
        <CardHeader>
          <CardTitle>Finding your next listen</CardTitle>
          <CardDescription>
            Considering your reflection and what you noticed…
          </CardDescription>
        </CardHeader>
      </Card>
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
