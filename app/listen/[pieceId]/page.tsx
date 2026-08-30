import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListenPageClient } from "@/app/listen/[pieceId]/listen-page-client";
import { getAllPieces, getPieceById } from "@/lib/pieces";

interface ListenPageProps {
  params: Promise<{ pieceId: string }>;
}

export function generateStaticParams() {
  return getAllPieces().map((piece) => ({ pieceId: piece.id }));
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
