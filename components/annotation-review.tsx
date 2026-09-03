"use client";

import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ANNOTATION_CATEGORIES,
  type AnnotationUpdate,
} from "@/hooks/use-editable-annotations";
import { annotationCategorySchema } from "@/lib/schemas/annotation";
import { formatTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import type { Annotation } from "@/types";

const fieldClassName =
  "w-full rounded-none border border-transparent border-b-input bg-transparent px-0 py-2 text-sm outline-none transition-[color,border-color] focus-visible:border-b-ring";

interface AnnotationReviewProps {
  annotations: Annotation[];
  onUpdate: (annotationId: string, updates: AnnotationUpdate) => void;
  onDelete: (annotationId: string) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export function AnnotationReview({
  annotations,
  onUpdate,
  onDelete,
  onRegenerate,
  isRegenerating = false,
}: AnnotationReviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AnnotationUpdate>({});

  const startEditing = (annotation: Annotation) => {
    setEditingId(annotation.id);
    setDraft({
      label: annotation.label,
      note: annotation.note,
      timestampSeconds: annotation.timestampSeconds,
      category: annotation.category,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEditing = () => {
    if (!editingId) {
      return;
    }

    const label = draft.label?.trim();
    const note = draft.note?.trim();
    const timestampSeconds = draft.timestampSeconds;

    if (!label || !note || timestampSeconds === undefined || timestampSeconds < 0) {
      return;
    }

    onUpdate(editingId, {
      label,
      note,
      timestampSeconds: Math.round(timestampSeconds),
      category: draft.category,
    });
    cancelEditing();
  };

  const handleDelete = (annotation: Annotation) => {
    if (editingId === annotation.id) {
      cancelEditing();
    }

    onDelete(annotation.id);
  };

  const handleRegenerate = () => {
    if (
      !window.confirm(
        "Regenerate annotations from AI? Your edits will be lost.",
      )
    ) {
      return;
    }

    cancelEditing();
    onRegenerate();
  };

  return (
    <section className="border-t border-border pt-2">
      <div className="flex items-center justify-between gap-3 py-3">
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isOpen ? "rotate-180" : "",
            )}
          />
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Review annotations
            </p>
            <p className="text-xs text-muted-foreground">
              Edit or remove markers if needed.
            </p>
          </div>
        </button>

        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={isRegenerating}
          onClick={handleRegenerate}
        >
          {isRegenerating ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>

      {isOpen ? (
        <ul className="space-y-4 border-t border-border py-4">
          {annotations.map((annotation) => {
            const isEditing = editingId === annotation.id;

            return (
              <li
                key={annotation.id}
                className="border-b border-border/70 pb-4 last:border-b-0 last:pb-0"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Time (seconds)
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className={fieldClassName}
                        value={draft.timestampSeconds ?? 0}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            timestampSeconds: Number(event.target.value),
                          }))
                        }
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Label
                      </span>
                      <input
                        type="text"
                        className={fieldClassName}
                        value={draft.label ?? ""}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            label: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Note
                      </span>
                      <Textarea
                        value={draft.note ?? ""}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            note: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Category
                      </span>
                      <select
                        className={cn(fieldClassName, "cursor-pointer")}
                        value={draft.category ?? "other"}
                        onChange={(event) => {
                          const parsed = annotationCategorySchema.safeParse(
                            event.target.value,
                          );

                          if (!parsed.success) {
                            return;
                          }

                          setDraft((current) => ({
                            ...current,
                            category: parsed.data,
                          }));
                        }}
                      >
                        {ANNOTATION_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex gap-2">
                      <Button type="button" size="xs" onClick={saveEditing}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          {formatTime(annotation.timestampSeconds)}
                        </span>
                        <Badge variant="secondary">{annotation.category}</Badge>
                      </div>
                      <p className="text-sm font-medium">{annotation.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {annotation.note}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Edit ${annotation.label}`}
                        onClick={() => startEditing(annotation)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Delete ${annotation.label}`}
                        onClick={() => handleDelete(annotation)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
