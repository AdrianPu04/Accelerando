import type { CatalogWork } from "@/lib/catalog/types";
import type { Piece } from "@/types";

export function catalogWorkToPiece(work: CatalogWork): Piece | null {
  if (!work.youtubeVideoId || !work.durationSeconds) {
    return null;
  }

  return {
    id: work.id,
    title: work.title,
    composer: work.composer,
    movement: work.subtitle,
    era: work.era,
    youtubeVideoId: work.youtubeVideoId,
    youtubeTitle: work.youtubeTitle,
    startOffsetSeconds: work.startOffsetSeconds ?? 0,
    durationSeconds: work.durationSeconds,
    openOpusWorkId: work.openOpusWorkId,
  };
}
