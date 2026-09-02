import { NextResponse } from "next/server";
import { z } from "zod";

import { getAnnotationProvider } from "@/lib/ai/get-provider";
import { AnnotationProviderError } from "@/lib/ai/types";
import {
  apiAuthErrorResponse,
  enforceRateLimit,
  requireApiUser,
} from "@/lib/api/require-auth";
import { toAnnotations } from "@/lib/annotations";
import { getPieceById } from "@/lib/pieces";
import { generateAnnotationsRequestSchema } from "@/lib/schemas/annotation";

export async function POST(request: Request) {
  try {
    const { userId } = await requireApiUser(request);
    enforceRateLimit(userId, "annotations");

    let json: unknown;

    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const body = generateAnnotationsRequestSchema.parse(json);
    const piece = getPieceById(body.pieceId);

    if (!piece) {
      return NextResponse.json({ error: "Piece not found" }, { status: 404 });
    }

    const provider = getAnnotationProvider();
    const generated = await provider.generateAnnotations(piece);
    const annotations = toAnnotations(piece.id, generated);

    return NextResponse.json({ annotations, provider: provider.name });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }

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
