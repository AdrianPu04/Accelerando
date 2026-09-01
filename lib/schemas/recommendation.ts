import { z } from "zod";

import { annotationCategorySchema } from "@/lib/schemas/annotation";
import { pieceSchema } from "@/lib/schemas/piece";

export const REFLECTION_MAX_LENGTH = 2000;

export const recommendNextRequestSchema = z.object({
  pieceId: z.string().min(1),
  reflection: z.object({
    id: z.string().min(1),
    text: z.string().min(1).max(REFLECTION_MAX_LENGTH),
    createdAt: z.string().min(1),
  }),
  annotations: z
    .array(
      z.object({
        timestampSeconds: z.number().int().nonnegative(),
        label: z.string().min(1),
        note: z.string().min(1),
        category: annotationCategorySchema,
      }),
    )
    .min(1),
});

export const selectPieceResponseSchema = z.object({
  pieceId: z.string().min(1),
});

export const recommendStreamEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("piece"),
    piece: pieceSchema,
    provider: z.string(),
  }),
  z.object({
    type: z.literal("delta"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("done"),
    provider: z.string(),
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
]);

export type RecommendNextRequest = z.infer<typeof recommendNextRequestSchema>;
export type SelectPieceResponse = z.infer<typeof selectPieceResponseSchema>;
export type RecommendStreamEvent = z.infer<typeof recommendStreamEventSchema>;
