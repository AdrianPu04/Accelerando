import { NextResponse } from "next/server";
import { z } from "zod";

import { getRecommendationProvider } from "@/lib/ai/get-recommendation-provider";
import { RecommendationProviderError } from "@/lib/ai/recommendation-types";
import type { RecommendNextContext } from "@/lib/prompts/recommend-next";
import { getAllPieces, getPieceById } from "@/lib/pieces";
import { recommendNextRequestSchema } from "@/lib/schemas/recommendation";
import type { Annotation, Piece } from "@/types";

type StreamEvent =
  | { type: "piece"; piece: Piece; provider: string }
  | { type: "delta"; text: string }
  | { type: "done"; provider: string }
  | { type: "error"; message: string };

function encodeEvent(event: StreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

function buildContext(
  piece: Piece,
  body: z.infer<typeof recommendNextRequestSchema>,
): RecommendNextContext {
  const annotations: Annotation[] = body.annotations.map((annotation, index) => ({
    id: `${body.pieceId}-req-${index + 1}`,
    pieceId: body.pieceId,
    ...annotation,
  }));

  return {
    piece,
    reflection: {
      id: body.reflection.id,
      pieceId: body.pieceId,
      text: body.reflection.text,
      createdAt: body.reflection.createdAt,
    },
    annotations,
    catalog: getAllPieces().filter((candidate) => candidate.id !== piece.id),
  };
}

export async function POST(request: Request) {
  try {
    let json: unknown;

    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const body = recommendNextRequestSchema.parse(json);
    const piece = getPieceById(body.pieceId);

    if (!piece) {
      return NextResponse.json({ error: "Piece not found" }, { status: 404 });
    }

    const context = buildContext(piece, body);

    if (context.catalog.length === 0) {
      return NextResponse.json(
        { error: "No pieces available to recommend" },
        { status: 400 },
      );
    }

    const provider = getRecommendationProvider();
    const selectedPieceId = await provider.selectPiece(context);
    const recommendedPiece = context.catalog.find(
      (candidate) => candidate.id === selectedPieceId,
    );

    if (!recommendedPiece) {
      return NextResponse.json(
        {
          error: "Model recommended an invalid piece",
          pieceId: selectedPieceId,
        },
        { status: 502 },
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encodeEvent({
            type: "piece",
            piece: recommendedPiece,
            provider: provider.name,
          }),
        );

        try {
          for await (const text of provider.streamReasoning(
            context,
            recommendedPiece,
          )) {
            controller.enqueue(encodeEvent({ type: "delta", text }));
          }

          controller.enqueue(
            encodeEvent({ type: "done", provider: provider.name }),
          );
          controller.close();
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to stream recommendation";

          controller.enqueue(encodeEvent({ type: "error", message }));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof RecommendationProviderError) {
      return NextResponse.json(
        { error: error.message, provider: error.provider },
        { status: error.statusCode },
      );
    }

    console.error("recommend-next error:", error);

    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 },
    );
  }
}
