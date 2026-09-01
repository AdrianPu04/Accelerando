import { GoogleGenerativeAI } from "@google/generative-ai";

import { buildGenerateAnnotationsMessages } from "@/lib/ai/prompt";
import { parseGenerateAnnotationsJson } from "@/lib/ai/parse-response";
import type { GeneratedAnnotation } from "@/lib/schemas/annotation";
import type { Piece } from "@/types";

import { AnnotationProviderError, type AnnotationProvider } from "../types";

const DEFAULT_MODEL = "gemini-3.6-flash";

export const geminiProvider: AnnotationProvider = {
  name: "gemini",

  async generateAnnotations(piece: Piece): Promise<GeneratedAnnotation[]> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new AnnotationProviderError(
        "GEMINI_API_KEY is not configured",
        "gemini",
      );
    }

    const modelName = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
    const { system, user } = buildGenerateAnnotationsMessages(piece);

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: system,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    try {
      const result = await model.generateContent(user);
      const text = result.response.text();

      if (!text) {
        throw new AnnotationProviderError(
          "Gemini returned an empty response",
          "gemini",
          502,
        );
      }

      return parseGenerateAnnotationsJson(text);
    } catch (error) {
      if (error instanceof AnnotationProviderError) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : "Gemini request failed";

      throw new AnnotationProviderError(message, "gemini", 502);
    }
  },
};
