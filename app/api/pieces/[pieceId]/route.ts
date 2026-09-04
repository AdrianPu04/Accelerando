import { NextResponse } from "next/server";

import { getPieceById } from "@/lib/pieces";

export async function GET(
  _request: Request,
  context: { params: Promise<{ pieceId: string }> },
) {
  const { pieceId } = await context.params;
  const piece = getPieceById(pieceId);

  if (!piece) {
    return NextResponse.json({ error: "Piece not found" }, { status: 404 });
  }

  return NextResponse.json(piece);
}
