import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTime } from "@/lib/format-time";
import type { Annotation } from "@/types";

interface AnnotationCardProps {
  annotation: Annotation | null;
}

export function AnnotationCard({ annotation }: AnnotationCardProps) {
  if (!annotation) {
    return (
      <Card>
        <CardContent className="text-muted-foreground">
          Play the recording — annotations will appear as you listen.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
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
