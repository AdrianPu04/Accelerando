import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { buildGenerateAnnotationsPrompt } from "@/lib/prompts/generate-annotations";
import { generateAnnotationsResponseSchema } from "@/lib/schemas/annotation";
import type { GeneratedAnnotation } from "@/lib/schemas/annotation";
import type { Piece } from "@/types";

import { AnnotationProviderError, type AnnotationProvider } from "../types";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export const anthropicProvider: AnnotationProvider = {
  name: "anthropic",

  async generateAnnotations(piece: Piece): Promise<GeneratedAnnotation[]> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new AnnotationProviderError(
        "ANTHROPIC_API_KEY is not configured",
        "anthropic",
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

    const message = await anthropic.messages.parse({
      model,
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildGenerateAnnotationsPrompt(piece),
        },
      ],
      output_config: {
        format: zodOutputFormat(generateAnnotationsResponseSchema),
      },
    });

    if (!message.parsed_output) {
      throw new AnnotationProviderError(
        "Failed to parse Anthropic annotation response",
        "anthropic",
        502,
      );
    }

    return message.parsed_output.annotations;
  },
};
