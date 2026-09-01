import { anthropicRecommendationProvider } from "@/lib/ai/providers/anthropic-recommend";
import { geminiRecommendationProvider } from "@/lib/ai/providers/gemini-recommend";
import {
  RecommendationProviderError,
  type RecommendationProvider,
} from "@/lib/ai/recommendation-types";
import type { AnnotationProviderName } from "@/lib/ai/types";

const providers: Record<AnnotationProviderName, RecommendationProvider> = {
  gemini: geminiRecommendationProvider,
  anthropic: anthropicRecommendationProvider,
};

function isProviderName(value: string): value is AnnotationProviderName {
  return value in providers;
}

export function getRecommendationProvider(): RecommendationProvider {
  const configured = process.env.ANNOTATION_PROVIDER?.toLowerCase();

  if (configured) {
    if (!isProviderName(configured)) {
      throw new Error(
        `Unknown ANNOTATION_PROVIDER "${configured}". Use gemini or anthropic.`,
      );
    }

    return providers[configured];
  }

  if (process.env.GEMINI_API_KEY) {
    return geminiRecommendationProvider;
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return anthropicRecommendationProvider;
  }

  throw new RecommendationProviderError(
    "No recommendation provider configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY.",
    "gemini",
  );
}
