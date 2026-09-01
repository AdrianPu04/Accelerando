"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Reflection } from "@/types";

interface ReflectionFormProps {
  pieceId: string;
  onSubmit: (reflection: Reflection) => void;
  submittedReflection?: Reflection | null;
}

export function ReflectionForm({
  pieceId,
  onSubmit,
  submittedReflection = null,
}: ReflectionFormProps) {
  const [text, setText] = useState("");

  if (submittedReflection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reflection saved</CardTitle>
          <CardDescription>
            Thanks — your notes will help shape what to listen to next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">
            {submittedReflection.text}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    onSubmit({
      id: crypto.randomUUID(),
      pieceId,
      text: trimmed,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What stood out?</CardTitle>
        <CardDescription>
          Jot down a moment, mood, or detail that caught your ear. There are no
          wrong answers.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          <label className="sr-only" htmlFor="reflection-text">
            Your reflection
          </label>
          <Textarea
            id="reflection-text"
            placeholder="A modulation, a timbre, a phrase that stuck with you…"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
          />
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={!text.trim()}>
            Save reflection
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
