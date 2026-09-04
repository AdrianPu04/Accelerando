import { GoogleGenerativeAI } from "@google/generative-ai";

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

const DEFAULT_MODEL = "gemini-3.5-flash-lite";

function extractChunkText(chunk: {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}): string {
  return (
    chunk.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? ""
  );
}

function parseSelectPieceJson(text: string): string {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new RecommendationProviderError(
      "Gemini piece selection did not contain JSON",
      "gemini",
      502,
    );
  }

  return selectPieceResponseSchema.parse(JSON.parse(jsonMatch[0])).pieceId;
}

export const geminiRecommendationProvider: RecommendationProvider = {
  name: "gemini",

  async selectPiece(context: RecommendNextContext): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new RecommendationProviderError(
        "GEMINI_API_KEY is not configured",
        "gemini",
      );
    }

    const modelName = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    try {
      const result = await model.generateContent(buildSelectPiecePrompt(context));
      const text = result.response.text();

      if (!text) {
        throw new RecommendationProviderError(
          "Gemini returned an empty piece selection",
          "gemini",
          502,
        );
      }

      return parseSelectPieceJson(text);
    } catch (error) {
      if (error instanceof RecommendationProviderError) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "Gemini request failed";

      throw new RecommendationProviderError(message, "gemini", 502);
    }
  },

  async *streamReasoning(
    context: RecommendNextContext,
    recommendedPiece: Piece,
  ): AsyncGenerator<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new RecommendationProviderError(
        "GEMINI_API_KEY is not configured",
        "gemini",
      );
    }

    const modelName = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
      },
    });

    try {
      const result = await model.generateContentStream(
        buildReasoningPrompt(context, recommendedPiece),
      );

      let yielded = false;

      try {
        for await (const chunk of result.stream) {
          const text = extractChunkText(chunk);
          if (text) {
            yielded = true;
            yield text;
          }
        }
      } catch (streamError) {
        if (yielded) {
          throw streamError;
        }

        const response = await result.response;
        const text = response.text();

        if (text) {
          yield text;
          return;
        }

        throw streamError;
      }
    } catch (error) {
      if (error instanceof RecommendationProviderError) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "Gemini stream failed";

      throw new RecommendationProviderError(message, "gemini", 502);
    }
  },
};
