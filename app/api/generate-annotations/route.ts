import { NextResponse } from "next/server";
import { z } from "zod";

import { getAnnotationProvider } from "@/lib/ai/get-provider";
import { AnnotationProviderError } from "@/lib/ai/types";
import { toAnnotations } from "@/lib/annotations";
import { getPieceById } from "@/lib/pieces";
import { generateAnnotationsRequestSchema } from "@/lib/schemas/annotation";

export async function POST(request: Request) {
  try {
    const body = generateAnnotationsRequestSchema.parse(await request.json());
    const piece = getPieceById(body.pieceId);

    if (!piece) {
      return NextResponse.json({ error: "Piece not found" }, { status: 404 });
    }

    const provider = getAnnotationProvider();
    const generated = await provider.generateAnnotations(piece);
    const annotations = toAnnotations(piece.id, generated);

    return NextResponse.json({ annotations, provider: provider.name });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof AnnotationProviderError) {
      return NextResponse.json(
        { error: error.message, provider: error.provider },
        { status: error.statusCode },
      );
    }

    console.error("generate-annotations error:", error);

    return NextResponse.json(
      { error: "Failed to generate annotations" },
      { status: 500 },
    );
  }
}
