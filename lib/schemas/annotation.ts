import { z } from "zod";

export const annotationCategorySchema = z.enum([
  "theme",
  "structure",
  "orchestration",
  "harmony",
  "dynamics",
  "other",
]);

export const generatedAnnotationSchema = z.object({
  timestampSeconds: z.number().int().nonnegative(),
  label: z.string().min(1),
  note: z.string().min(1),
  category: annotationCategorySchema,
});

export const generateAnnotationsResponseSchema = z.object({
  annotations: z.array(generatedAnnotationSchema).min(3).max(12),
});

export const generateAnnotationsRequestSchema = z.object({
  pieceId: z.string().min(1),
});

export type GeneratedAnnotation = z.infer<typeof generatedAnnotationSchema>;
export type GenerateAnnotationsResponse = z.infer<
  typeof generateAnnotationsResponseSchema
>;
