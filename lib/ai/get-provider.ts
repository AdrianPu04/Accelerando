import { anthropicProvider } from "@/lib/ai/providers/anthropic";
import { geminiProvider } from "@/lib/ai/providers/gemini";
import {
  AnnotationProviderError,
  type AnnotationProvider,
  type AnnotationProviderName,
} from "@/lib/ai/types";

const providers: Record<AnnotationProviderName, AnnotationProvider> = {
  gemini: geminiProvider,
  anthropic: anthropicProvider,
};

function isAnnotationProviderName(
  value: string,
): value is AnnotationProviderName {
  return value in providers;
}

export function getAnnotationProvider(): AnnotationProvider {
  const configured = process.env.ANNOTATION_PROVIDER?.toLowerCase();

  if (configured) {
    if (!isAnnotationProviderName(configured)) {
      throw new Error(
        `Unknown ANNOTATION_PROVIDER "${configured}". Use gemini or anthropic.`,
      );
    }

    return providers[configured];
  }

  if (process.env.GEMINI_API_KEY) {
    return geminiProvider;
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return anthropicProvider;
  }

  throw new AnnotationProviderError(
    "No annotation provider configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY.",
    "gemini",
  );
}
