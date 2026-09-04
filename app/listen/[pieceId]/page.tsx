import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListenPageClient } from "@/app/listen/[pieceId]/listen-page-client";
import { HOME_START_PIECE_IDS, getPieceById } from "@/lib/pieces";

interface ListenPageProps {
  params: Promise<{ pieceId: string }>;
}

/** Prefetch featured starters; other catalog pieces render on demand. */
export function generateStaticParams() {
  return HOME_START_PIECE_IDS.map((pieceId) => ({ pieceId }));
}

export async function generateMetadata({
  params,
}: ListenPageProps): Promise<Metadata> {
  const { pieceId } = await params;
  const piece = getPieceById(pieceId);

  if (!piece) {
    return { title: "Piece not found" };
  }

  return {
    title: `${piece.composer} — ${piece.title}`,
    description: piece.movement ?? piece.title,
  };
}

export default async function ListenPage({ params }: ListenPageProps) {
  const { pieceId } = await params;
  const piece = getPieceById(pieceId);

  if (!piece) {
    notFound();
  }

  return <ListenPageClient piece={piece} />;
}
