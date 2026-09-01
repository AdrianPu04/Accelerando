import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import {
  RecommendationProviderError,
  type RecommendationProvider,
} from "@/lib/ai/recommendation-types";
import {
  buildReasoningPrompt,
  buildSelectPiecePrompt,
  type RecommendNextContext,
} from "@/lib/prompts/recommend-next";
import { selectPieceResponseSchema } from "@/lib/schemas/recommendation";
import type { Piece } from "@/types";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export const anthropicRecommendationProvider: RecommendationProvider = {
  name: "anthropic",

  async selectPiece(context: RecommendNextContext): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new RecommendationProviderError(
        "ANTHROPIC_API_KEY is not configured",
        "anthropic",
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

    try {
      const message = await anthropic.messages.parse({
        model,
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: buildSelectPiecePrompt(context),
          },
        ],
        output_config: {
          format: zodOutputFormat(selectPieceResponseSchema),
        },
      });

      if (!message.parsed_output) {
        throw new RecommendationProviderError(
          "Failed to parse Anthropic piece selection",
          "anthropic",
          502,
        );
      }

      return message.parsed_output.pieceId;
    } catch (error) {
      if (error instanceof RecommendationProviderError) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "Anthropic request failed";

      throw new RecommendationProviderError(message, "anthropic", 502);
    }
  },

  async *streamReasoning(
    context: RecommendNextContext,
    recommendedPiece: Piece,
  ): AsyncGenerator<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new RecommendationProviderError(
        "ANTHROPIC_API_KEY is not configured",
        "anthropic",
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

    try {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: buildReasoningPrompt(context, recommendedPiece),
          },
        ],
      });

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      }
    } catch (error) {
      if (error instanceof RecommendationProviderError) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "Anthropic stream failed";

      throw new RecommendationProviderError(message, "anthropic", 502);
    }
  },
};
