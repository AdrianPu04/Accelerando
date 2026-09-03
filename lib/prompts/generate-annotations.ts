import type { Piece } from "@/types";

/** Target annotation density: about one every two minutes, bounded for short/long works. */
export function suggestedAnnotationRange(durationSeconds: number): {
  min: number;
  max: number;
} {
  const target = Math.max(8, Math.round(durationSeconds / 120));
  const min = Math.max(8, Math.round(target * 0.8));
  const max = Math.min(40, Math.max(min + 2, Math.round(target * 1.25)));
  return { min, max };
}

function formatClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

export function buildGenerateAnnotationsPrompt(piece: Piece): string {
  const { min, max } = suggestedAnnotationRange(piece.durationSeconds);
  const recordingTitle = piece.youtubeTitle?.trim();
  const youtubeUrl = `https://www.youtube.com/watch?v=${piece.youtubeVideoId}`;

  return `You are generating guided listening annotations for a classical music app.

Piece metadata:
- Title: ${piece.title}
- Composer: ${piece.composer}
- Movement / subtitle: ${piece.movement ?? "N/A"}
- Era: ${piece.era}
- Listening duration for THIS recording: ${piece.durationSeconds} seconds (${formatClock(piece.durationSeconds)})
- YouTube video id: ${piece.youtubeVideoId}
- YouTube URL: ${youtubeUrl}
${recordingTitle ? `- YouTube recording title: ${recordingTitle}` : ""}
- Piece start offset in the YouTube video: ${piece.startOffsetSeconds} seconds (annotation time 0 is this point)

Recording-specific timestamp rules:
- Tailor timestamps to THIS recording's timeline and length, not a generic or different edition.
- Use the YouTube title to infer scope (complete work, single movement, suite excerpt, live concert with applause/talk, etc.) and place landmarks accordingly.
- timestampSeconds is relative to guided listening start (0 = piece startOffset in the video), and must stay within 0..${piece.durationSeconds - 1}.
- Space annotations across the full listening duration. Do not cluster them near the beginning.
- Prefer major structural and expressive landmarks as they typically fall in a performance of about this length (themes, transitions, climaxes, recapitulations, finales).
- You cannot hear the audio; combine the recording metadata above with standard knowledge of this work's form.

Density:
- Provide ${min}-${max} annotations for a work of this length (roughly one every ~2 minutes, adjusted for structure).
- Longer recordings need more annotations; never stop at a small fixed count like 6-10 if the duration warrants denser coverage.

Writing:
- Write for a curious listener, not a conservatory student. Prefer plain language.
- Each label is a short tag (under 8 words).
- Each note is a rich guided-listening paragraph of 4-6 sentences: what is happening in the music right now, concrete sounds or textures to notice, how this moment fits the larger form, and why it matters emotionally or dramatically.
- If you use a technical term (e.g. recapitulation, tonic, ostinato, counterpoint, cadenza, modulation), immediately gloss it in everyday words in the same note — e.g. "recapitulation (when the opening themes return)".
- Keep each note self-contained and rewarding to read while listening; do not add a separate glossary section.
- Use categories: theme, structure, orchestration, harmony, dynamics, or other.
- Do not mention AI, recordings, or analysis limitations in the annotation text itself.`;
}
