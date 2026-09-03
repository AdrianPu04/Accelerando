import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCatalogWorkById } from "@/lib/catalog";
import { catalogWorkToPiece } from "@/lib/catalog/to-piece";
import { isCatalogWorkPlayable } from "@/lib/catalog/types";
import {
  getPlayablePieceForOpenOpusWork,
  getPlayablePiecesForComposer,
} from "@/lib/pieces";
import { cn } from "@/lib/utils";

interface PiecePageProps {
  params: Promise<{ pieceId: string }>;
}

export async function generateMetadata({
  params,
}: PiecePageProps): Promise<Metadata> {
  const { pieceId } = await params;
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-4">
        <Link
          href="/library"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
        >
          Library
        </Link>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{work.era}</Badge>
            <Badge variant="outline">{work.genre}</Badge>
            {work.recommended ? <Badge variant="outline">Essential</Badge> : null}
            {work.popular ? <Badge variant="outline">Popular</Badge> : null}
          </div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {work.composerCompleteName}
          </p>
          <h1 className="font-heading text-4xl font-semibold">{work.title}</h1>
          {work.subtitle ? (
            <p className="text-muted-foreground">{work.subtitle}</p>
          ) : null}
        </div>
      </header>

      {exactPlayable ? (
        <Card>
          <CardHeader>
            <CardTitle>Guided listening available</CardTitle>
            <CardDescription>
              This work has a curated YouTube recording with synced annotations.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href={`/listen/${exactPlayable.id}`}
              className={cn(buttonVariants())}
            >
              Start listening
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Catalog entry</CardTitle>
            <CardDescription>
              Open Opus provides metadata for this work. A curated recording for
              guided listening hasn&apos;t been linked yet.
            </CardDescription>
          </CardHeader>
          {composerPlayables.length > 0 ? (
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Meanwhile, you can listen to another {work.composer} work we
                already support:
              </p>
              <div className="flex flex-wrap gap-2">
                {composerPlayables.map((piece) => (
                  <Link
                    key={piece.id}
                    href={`/listen/${piece.id}`}
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                  >
                    {piece.movement ?? piece.title}
                  </Link>
                ))}
              </div>
            </CardContent>
          ) : null}
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Metadata from{" "}
        <a
          href="https://openopus.org"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          Open Opus
        </a>{" "}
        (public domain). Work ID {work.openOpusWorkId}.
      </p>
    </div>
  );
}
