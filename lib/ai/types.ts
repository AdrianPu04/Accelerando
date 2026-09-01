import type { Piece } from "@/types";

import type { GeneratedAnnotation } from "@/lib/schemas/annotation";

export type AnnotationProviderName = "gemini" | "anthropic";

export interface AnnotationProvider {
  name: AnnotationProviderName;
  generateAnnotations(piece: Piece): Promise<GeneratedAnnotation[]>;
}

export class AnnotationProviderError extends Error {
  constructor(
    message: string,
    readonly provider?: AnnotationProviderName,
    readonly statusCode = 500,
  ) {
    super(message);
    this.name = "AnnotationProviderError";
  }
}
