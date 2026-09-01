import { z } from "zod";

import { annotationCategorySchema } from "@/lib/schemas/annotation";

export const recommendNextRequestSchema = z.object({
  pieceId: z.string().min(1),
  reflection: z.object({
    id: z.string().min(1),
    text: z.string().min(1),
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

export type RecommendNextRequest = z.infer<typeof recommendNextRequestSchema>;
export type SelectPieceResponse = z.infer<typeof selectPieceResponseSchema>;
