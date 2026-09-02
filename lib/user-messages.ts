export interface UserMessage {
  title: string;
  description: string;
}

export function formatAiError(raw: string): UserMessage {
  const lower = raw.toLowerCase();

  if (lower.includes("unauthorized") || lower.includes("not signed in")) {
    return {
      title: "Session expired",
      description: "Refresh the page to reconnect, then try again.",
    };
  }

  if (
    lower.includes("429") ||
    lower.includes("quota") ||
    lower.includes("rate limit")
  ) {
    return {
      title: "AI rate limit reached",
      description:
        "You've hit the free-tier limit for this model. Wait a minute and retry, or try a different GEMINI_MODEL in your env.",
    };
  }

  if (lower.includes("503") || lower.includes("high demand")) {
    return {
      title: "AI service is busy",
      description:
        "Gemini is temporarily overloaded. Wait a moment and try again.",
    };
  }

  if (lower.includes("502") || lower.includes("failed to generate")) {
    return {
      title: "Could not generate",
      description:
        "The AI service returned an error. Try again in a moment.",
    };
  }

  if (raw.length > 160) {
    return {
      title: "Something went wrong",
      description:
        "The AI service returned an unexpected error. Please try again.",
    };
  }

  return {
    title: "Something went wrong",
    description: raw,
  };
}

export function formatStorageError(raw?: string): UserMessage {
  if (raw?.toLowerCase().includes("not authenticated")) {
    return {
      title: "Not signed in",
      description: "Refresh the page to restore your session.",
    };
  }

  return {
    title: "Could not save",
    description:
      raw ??
      "Your changes could not be saved. Check your connection and try again.",
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong";
}
