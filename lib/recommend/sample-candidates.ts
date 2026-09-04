import type { Piece } from "@/types";

const DEFAULT_LIMIT = 40;

/**
 * Diversify recommend candidates across era + composer instead of taking the
 * first N catalog rows (which cluster on early composers alphabetically).
 */
export function sampleRecommendCandidates(
  pieces: Piece[],
  options: {
    excludeId?: string;
    excludeIds?: Iterable<string>;
    limit?: number;
  } = {},
): Piece[] {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const excluded = new Set<string>(options.excludeIds ?? []);
  if (options.excludeId) {
    excluded.add(options.excludeId);
  }

  const pool = pieces.filter((piece) => !excluded.has(piece.id));

  if (pool.length <= limit) {
    return pool;
  }

  const byEra = new Map<string, Piece[]>();
  for (const piece of pool) {
    const era = piece.era || "Unknown";
    const bucket = byEra.get(era) ?? [];
    bucket.push(piece);
    byEra.set(era, bucket);
  }

  for (const bucket of byEra.values()) {
    shuffleInPlace(bucket);
  }

  const eras = [...byEra.keys()].sort();
  const selected: Piece[] = [];
  const usedComposers = new Set<string>();
  let eraIndex = 0;

  while (selected.length < limit) {
    let added = false;

    for (let pass = 0; pass < eras.length && selected.length < limit; pass += 1) {
      const era = eras[(eraIndex + pass) % eras.length];
      const bucket = byEra.get(era);
      if (!bucket?.length) {
        continue;
      }

      const preferredIndex = bucket.findIndex(
        (piece) => !usedComposers.has(composerKey(piece.composer)),
      );
      const index = preferredIndex >= 0 ? preferredIndex : 0;
      const [piece] = bucket.splice(index, 1);
      if (!piece) {
        continue;
      }

      selected.push(piece);
      usedComposers.add(composerKey(piece.composer));
      added = true;
    }

    eraIndex += 1;

    if (!added) {
      break;
    }
  }

  return selected;
}

function composerKey(composer: string): string {
  return composer.trim().toLowerCase();
}

function shuffleInPlace<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i];
    items[i] = items[j]!;
    items[j] = tmp!;
  }
}
