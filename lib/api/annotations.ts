import type { Annotation } from "@/types";

interface GenerateAnnotationsResponse {
  annotations: Annotation[];
  provider?: string;
}

interface GenerateAnnotationsError {
  error: string;
  provider?: string;
}

export async function fetchAnnotations(pieceId: string): Promise<Annotation[]> {
  const response = await fetch("/api/generate-annotations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pieceId }),
  });

  const data = (await response.json()) as
    | GenerateAnnotationsResponse
    | GenerateAnnotationsError;

  if (!response.ok) {
    throw new Error(
      "error" in data && data.error
        ? data.error
        : "Failed to generate annotations",
    );
  }

  if (!("annotations" in data) || !Array.isArray(data.annotations)) {
    throw new Error("Invalid annotation response");
  }

  return data.annotations;
}
