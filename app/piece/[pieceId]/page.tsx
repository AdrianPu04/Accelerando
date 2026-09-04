import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { getCatalogWorkById } from "@/lib/catalog";
import { catalogWorkToPiece } from "@/lib/catalog/to-piece";
import { isCatalogWorkPlayable } from "@/lib/catalog/types";
import { getCuratedPieceById } from "@/lib/curated-pieces";
import {
  getPlayablePieceForOpenOpusWork,
  getPlayablePiecesForComposer,
} from "@/lib/pieces";
import { cn } from "@/lib/utils";
import type { Piece } from "@/types";

interface PiecePageProps {
  params: Promise<{ pieceId: string }>;
}

function CuratedPiecePage({ piece }: { piece: Piece }) {
  const catalogHref = piece.openOpusWorkId
    ? `/piece/openopus-${piece.openOpusWorkId}`
    : null;

  return (
    <AppShell>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-start">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {piece.composer}
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance">
            {piece.title}
          </h1>
          {piece.movement ? (
            <p className="text-muted-foreground">{piece.movement}</p>
          ) : null}
          <p className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
            {piece.era} · Featured recording
          </p>
        </header>

        <aside className="space-y-6 border-t border-border pt-6 lg:sticky lg:top-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Guided listening
              </p>
              <p className="text-sm text-muted-foreground">
                A curated complete-symphony recording with synced annotations.
              </p>
            </div>
            <Link href={`/listen/${piece.id}`} className={cn(buttonVariants())}>
              Start listening
            </Link>
            {catalogHref ? (
              <p className="text-sm text-muted-foreground">
                <Link
                  href={catalogHref}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  View full work in catalog
                </Link>
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

export async function generateMetadata({
  params,
}: PiecePageProps): Promise<Metadata> {
  const { pieceId } = await params;
  const curated = getCuratedPieceById(pieceId);
  if (curated) {
    return {
      title: `${curated.composer} — ${curated.title}`,
      description: curated.movement ?? curated.title,
    };
  }

  const work = getCatalogWorkById(pieceId);

  if (!work) {
    return { title: "Work not found" };
  }

  return {
    title: `${work.composer} — ${work.title}`,
    description: work.subtitle ?? `${work.era} · ${work.genre}`,
  };
}

export default async function PiecePage({ params }: PiecePageProps) {
  const { pieceId } = await params;
  const curated = getCuratedPieceById(pieceId);
  if (curated) {
    return <CuratedPiecePage piece={curated} />;
  }

  const work = getCatalogWorkById(pieceId);

  if (!work) {
    notFound();
  }

  const exactPlayable =
    (isCatalogWorkPlayable(work) ? catalogWorkToPiece(work) : null) ??
    getPlayablePieceForOpenOpusWork(work.openOpusWorkId);
  const composerPlayables = getPlayablePiecesForComposer(work.composer).filter(
    (piece) => piece.id !== exactPlayable?.id,
  );

  const metaBits = [
    work.era,
    work.genre,
    work.recommended ? "Essential" : null,
    work.popular ? "Popular" : null,
  ].filter(Boolean);

  return (
    <AppShell>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-start">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {work.composerCompleteName}
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance">
            {work.title}
          </h1>
          {work.subtitle ? (
            <p className="text-muted-foreground">{work.subtitle}</p>
          ) : null}
          <p className="text-[0.65rem] font-semibold tracking-widest text-muted-foreground uppercase">
            {metaBits.join(" · ")}
          </p>
          <p className="pt-4 text-xs text-muted-foreground">
            Metadata from{" "}
            <a
              href="https://openopus.org"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Open Opus
            </a>
            . Work ID {work.openOpusWorkId}.
          </p>
        </header>

        <aside className="space-y-6 border-t border-border pt-6 lg:sticky lg:top-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {exactPlayable ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Guided listening
                </p>
                <p className="text-sm text-muted-foreground">
                  This work has a YouTube recording with synced annotations.
                </p>
              </div>
              <Link
                href={`/listen/${exactPlayable.id}`}
                className={cn(buttonVariants())}
              >
                Start listening
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Catalog entry
                </p>
                <p className="text-sm text-muted-foreground">
                  A recording for guided listening hasn&apos;t been linked yet.
                </p>
              </div>
              {composerPlayables.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Other {work.composer} works you can listen to:
                  </p>
                  <ul className="space-y-2">
                    {composerPlayables.map((piece) => (
                      <li key={piece.id}>
                        <Link
                          href={`/listen/${piece.id}`}
                          className="text-sm underline-offset-4 hover:underline"
                        >
                          {piece.movement ?? piece.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
