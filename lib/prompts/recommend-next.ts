import { formatTime } from "@/lib/format-time";
import type { Annotation, Piece, Reflection } from "@/types";

export interface RecommendNextContext {
  piece: Piece;
  reflection: Reflection;
  annotations: Annotation[];
  catalog: Piece[];
}

function formatPieceSummary(piece: Piece): string {
  return `- id: ${piece.id}
  title: ${piece.title}
  composer: ${piece.composer}
  movement: ${piece.movement ?? "N/A"}
  era: ${piece.era}`;
}

function formatAnnotations(annotations: Annotation[]): string {
  return annotations
    .map(
      (annotation) =>
        `- ${formatTime(annotation.timestampSeconds)} [${annotation.category}] ${annotation.label}: ${annotation.note}`,
    )
    .join("\n");
}

export function buildSelectPiecePrompt({
  piece,
  reflection,
  annotations,
  catalog,
}: RecommendNextContext): string {
  return `You are selecting the next piece for a guided classical listening journey.

The listener just finished:
${formatPieceSummary(piece)}

Their reflection:
"${reflection.text}"

Annotations from the session:
${formatAnnotations(annotations)}

Choose exactly one next piece from this catalog. Pick something that connects to what they responded to — era, mood, orchestration, form, or emotional contour. Do not recommend the piece they just heard.

Catalog:
${catalog.map(formatPieceSummary).join("\n")}

Return JSON only:
{ "pieceId": "<id from catalog>" }`;
}

export function buildReasoningPrompt(
  { piece, reflection, annotations }: RecommendNextContext,
  recommendedPiece: Piece,
): string {
  return `You are explaining why a listener should hear a specific next piece.

They just finished:
${formatPieceSummary(piece)}

Their reflection:
"${reflection.text}"

Annotations from the session:
${formatAnnotations(annotations)}

Recommended next piece:
${formatPieceSummary(recommendedPiece)}

Write 2-4 short paragraphs explaining why this is a good next listen. Requirements:
- Reference specific details from their reflection and from annotation timestamps when relevant (e.g. "the moment at 3:40").
- Explain the musical connection — not just "you might also like" but why this piece extends or contrasts with what they noticed.
- Write directly to the listener in second person.
- Do not mention AI, algorithms, or that you have not heard the recording.
- Do not use markdown headings or bullet lists.`;
}
