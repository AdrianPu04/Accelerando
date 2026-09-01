import { buildGenerateAnnotationsPrompt } from "@/lib/prompts/generate-annotations";
import type { Piece } from "@/types";

export function buildGenerateAnnotationsMessages(piece: Piece): {
  system: string;
  user: string;
} {
  return {
    system:
      "You generate guided listening annotations for classical music. Respond with JSON only.",
    user: `${buildGenerateAnnotationsPrompt(piece)}

Return JSON with this exact shape:
{
  "annotations": [
    {
      "timestampSeconds": 120,
      "label": "Short tag",
      "note": "One or two sentences for the listener.",
      "category": "structure"
    }
  ]
}

Valid categories: theme, structure, orchestration, harmony, dynamics, other.`,
  };
}
