"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAnnotationById } from "@/lib/annotations";
import { formatTime } from "@/lib/format-time";
import { usePlayerStore } from "@/stores/player-store";
import type { Annotation } from "@/types";

interface AnnotationCardProps {
  annotations: Annotation[];
}

export function AnnotationCard({ annotations }: AnnotationCardProps) {
  const activeAnnotationId = usePlayerStore(
    (state) => state.activeAnnotationId,
  );
  const annotation = getAnnotationById(annotations, activeAnnotationId);

  if (!annotation) {
    return (
      <Card aria-live="polite">
        <CardContent className="text-muted-foreground">
          Play the recording — annotations will appear as you listen.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card aria-live="polite">
      <CardHeader>
        <Badge variant="secondary">{annotation.category}</Badge>
        <CardTitle>{annotation.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="leading-relaxed">{annotation.note}</p>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatTime(annotation.timestampSeconds)}
        </p>
      </CardContent>
    </Card>
  );
}
