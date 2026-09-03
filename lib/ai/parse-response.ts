import { z } from "zod";

import { generateAnnotationsResponseSchema } from "@/lib/schemas/annotation";
import type { GeneratedAnnotation } from "@/lib/schemas/annotation";

export function parseGenerateAnnotationsResponse(
  raw: unknown,
): GeneratedAnnotation[] {
  return generateAnnotationsResponseSchema.parse(raw).annotations;
}

export function parseGenerateAnnotationsJson(text: string): GeneratedAnnotation[] {
  const trimmed = text.trim();

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Model response did not contain JSON");
  }

  try {
    return parseGenerateAnnotationsResponse(JSON.parse(jsonMatch[0]));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Annotation response failed validation: ${error.issues
          .slice(0, 3)
          .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
          .join("; ")}`,
      );
    }

    throw error;
  }
}
