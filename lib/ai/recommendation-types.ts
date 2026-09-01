import type { RecommendNextContext } from "@/lib/prompts/recommend-next";
import type { Piece } from "@/types";

import type { AnnotationProviderName } from "./types";

export interface RecommendationProvider {
  name: AnnotationProviderName;
  selectPiece(context: RecommendNextContext): Promise<string>;
  streamReasoning(
    context: RecommendNextContext,
    recommendedPiece: Piece,
  ): AsyncGenerator<string>;
}

export class RecommendationProviderError extends Error {
  constructor(
    message: string,
    readonly provider?: AnnotationProviderName,
    readonly statusCode = 500,
  ) {
    super(message);
    this.name = "RecommendationProviderError";
  }
}
