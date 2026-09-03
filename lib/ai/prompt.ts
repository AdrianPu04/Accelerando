import { buildGenerateAnnotationsPrompt } from "@/lib/prompts/generate-annotations";
import type { Piece } from "@/types";

export function buildGenerateAnnotationsMessages(piece: Piece): {
  system: string;
  user: string;
} {
  return {
    system:
      "You generate guided listening annotations for classical music, tailored to a specific YouTube recording's timeline and length. Respond with JSON only.",
    user: `${buildGenerateAnnotationsPrompt(piece)}

Return JSON with this exact shape:
{
  "annotations": [
    {
      "timestampSeconds": 120,
      "label": "Short tag",
      "note": "A rich 4-6 sentence guided-listening paragraph: what is happening, what to notice in the sound, how it fits the form, and why it matters — with plain-language glosses for any technical terms.",
      "category": "structure"
    }
  ]
}

Valid categories: theme, structure, orchestration, harmony, dynamics, other.`,
  };
}
