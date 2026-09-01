import type { Piece } from "@/types";

export function buildGenerateAnnotationsPrompt(piece: Piece): string {
  return `You are generating guided listening annotations for a classical music app.

Piece metadata:
- Title: ${piece.title}
- Composer: ${piece.composer}
- Movement: ${piece.movement ?? "N/A"}
- Era: ${piece.era}
- Approximate duration: ${piece.durationSeconds} seconds

Important constraints:
- You have NOT heard any specific recording. Timestamps are approximate structural landmarks for this movement.
- Spread annotations across the full duration. Do not cluster them at the start.
- Provide 6-10 annotations.
- Each label is a short tag (under 8 words).
- Each note is 1-2 sentences for an attentive listener.
- Use categories that reflect musical content: theme, structure, orchestration, harmony, dynamics, or other.
- Do not mention AI, recordings, or analysis limitations in the annotation text itself.`;
}
