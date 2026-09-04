import { z } from "zod";

export const annotationCategorySchema = z.enum([
  "theme",
  "structure",
  "orchestration",
  "harmony",
  "dynamics",
  "other",
]);

const generatedAnnotationSchema = z.object({
  timestampSeconds: z.number().int().nonnegative(),
  label: z.string().min(1),
  note: z.string().min(1),
  category: annotationCategorySchema,
});

export const generateAnnotationsResponseSchema = z.object({
  annotations: z.array(generatedAnnotationSchema).min(3).max(24),
});

export const generateAnnotationsRequestSchema = z.object({
  pieceId: z.string().min(1),
});

const annotationSchema = z.object({
  id: z.string().min(1),
  pieceId: z.string().min(1),
  timestampSeconds: z.number().int().nonnegative(),
  label: z.string().min(1),
  note: z.string().min(1),
  category: annotationCategorySchema,
});

export const generateAnnotationsApiResponseSchema = z.object({
  annotations: z.array(annotationSchema).min(1),
  provider: z.string().optional(),
});

export type GeneratedAnnotation = z.infer<typeof generatedAnnotationSchema>;
