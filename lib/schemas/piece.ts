import { z } from "zod";

export const pieceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  composer: z.string().min(1),
  movement: z.string().optional(),
  era: z.string().min(1),
  youtubeVideoId: z.string().min(1),
  startOffsetSeconds: z.number().int().nonnegative(),
  durationSeconds: z.number().int().positive(),
  openOpusWorkId: z.string().optional(),
});

export type PieceSchema = z.infer<typeof pieceSchema>;
