"use client";

import { useState } from "react";

import { ErrorPanel } from "@/components/status-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { REFLECTION_MAX_LENGTH } from "@/lib/schemas/recommendation";
import type { Reflection } from "@/types";

interface ReflectionFormProps {
  pieceId: string;
  onSubmit: (reflection: Reflection) => void | Promise<void>;
  submittedReflection?: Reflection | null;
  isSaving?: boolean;
  saveError?: string | null;
}

export function ReflectionForm({
  pieceId,
  onSubmit,
  submittedReflection = null,
  isSaving = false,
  saveError = null,
}: ReflectionFormProps) {
  const [text, setText] = useState("");

  if (submittedReflection) {
    return (
      <section className="max-w-prose space-y-3 border-t border-border pt-8">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Your reflection
        </p>
        <p className="text-base leading-relaxed">{submittedReflection.text}</p>
      </section>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || trimmed.length > REFLECTION_MAX_LENGTH || isSaving) {
      return;
    }

    void onSubmit({
      id: crypto.randomUUID(),
      pieceId,
      text: trimmed,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <section className="max-w-prose space-y-4 border-t border-border pt-8">
      {saveError ? (
        <ErrorPanel
          title="Could not save reflection"
          description={saveError}
        />
      ) : null}

      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          What stood out?
        </h2>
        <p className="text-sm text-muted-foreground">
          A moment, mood, or detail that caught your ear. No wrong answers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="sr-only" htmlFor="reflection-text">
          Your reflection
        </label>
        <Textarea
          id="reflection-text"
          placeholder="A modulation, a timbre, a phrase that stuck with you…"
          value={text}
          maxLength={REFLECTION_MAX_LENGTH}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          disabled={isSaving}
          className="min-h-28 rounded-none border-0 border-b border-input bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0"
        />
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground tabular-nums">
            {text.length}/{REFLECTION_MAX_LENGTH}
          </p>
          <Button type="submit" size="sm" disabled={!text.trim() || isSaving}>
            {isSaving ? "Saving…" : "Save reflection"}
          </Button>
        </div>
      </form>
    </section>
  );
}
