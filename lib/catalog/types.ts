import { z } from "zod";

/** Catalog work from OpenOpus, optionally enriched with a YouTube recording. */
export const catalogWorkSchema = z.object({
  id: z.string().min(1),
  openOpusWorkId: z.string().min(1),
  openOpusComposerId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  composer: z.string().min(1),
  composerCompleteName: z.string().min(1),
  era: z.string().min(1),
  genre: z.string().min(1),
  popular: z.boolean(),
  recommended: z.boolean(),
  portraitUrl: z.string().optional(),
  youtubeVideoId: z.string().optional(),
  youtubeTitle: z.string().optional(),
  durationSeconds: z.number().int().positive().optional(),
  startOffsetSeconds: z.number().int().nonnegative().optional(),
  youtubeMatchedAt: z.string().optional(),
});

export const catalogFileSchema = z.object({
  source: z.literal("openopus"),
  generatedAt: z.string(),
  works: z.array(catalogWorkSchema),
});

export type CatalogWork = z.infer<typeof catalogWorkSchema>;

export function isCatalogWorkPlayable(work: CatalogWork): boolean {
  return Boolean(work.youtubeVideoId && work.durationSeconds);
}
