import type { Annotation } from "@/types";

export const FAKE_ANNOTATIONS: Annotation[] = [
  {
    id: "beethoven-7-i-1",
    pieceId: "beethoven-7-i",
    timestampSeconds: 18,
    label: "Slow introduction opens",
    note: "Long, quiet chords in the woodwinds and horns establish a spacious, suspenseful atmosphere.",
    category: "structure",
  },
  {
    id: "beethoven-7-i-2",
    pieceId: "beethoven-7-i",
    timestampSeconds: 75,
    label: "Rhythmic pulse emerges",
    note: "The short-long-long pattern begins to drive the music forward, a hallmark of this movement.",
    category: "theme",
  },
  {
    id: "beethoven-7-i-3",
    pieceId: "beethoven-7-i",
    timestampSeconds: 145,
    label: "Main theme in full",
    note: "The vivace theme arrives with full orchestral force — energetic, dance-like, and unmistakably Beethoven.",
    category: "theme",
  },
  {
    id: "beethoven-7-i-4",
    pieceId: "beethoven-7-i",
    timestampSeconds: 280,
    label: "Development intensifies",
    note: "Themes fragment and recombine; listen for the rising tension in the strings and brass.",
    category: "structure",
  },
  {
    id: "beethoven-7-i-5",
    pieceId: "beethoven-7-i",
    timestampSeconds: 420,
    label: "Dynamic surge",
    note: "A sudden fortissimo passage — the orchestra swells as Beethoven pushes the energy to a peak.",
    category: "dynamics",
  },
  {
    id: "beethoven-7-i-6",
    pieceId: "beethoven-7-i",
    timestampSeconds: 560,
    label: "Orchestral color shift",
    note: "Notice how Beethoven hands the melody between sections, changing timbre without losing momentum.",
    category: "orchestration",
  },
  {
    id: "beethoven-7-i-7",
    pieceId: "beethoven-7-i",
    timestampSeconds: 680,
    label: "Coda builds",
    note: "The movement races toward its close — rhythmic drive intensifies as the orchestra piles on layers.",
    category: "structure",
  },
  {
    id: "beethoven-7-i-8",
    pieceId: "beethoven-7-i",
    timestampSeconds: 760,
    label: "Final chords",
    note: "The movement ends with emphatic A-major chords, releasing the tension built across the entire span.",
    category: "harmony",
  },
];

export function getAnnotationsForPiece(pieceId: string): Annotation[] {
  return FAKE_ANNOTATIONS.filter((annotation) => annotation.pieceId === pieceId).sort(
    (a, b) => a.timestampSeconds - b.timestampSeconds,
  );
}
