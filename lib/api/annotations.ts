import { generateAnnotationsApiResponseSchema } from "@/lib/schemas/annotation";
import type { Annotation } from "@/types";

export async function fetchAnnotations(pieceId: string): Promise<Annotation[]> {
  const response = await fetch("/api/generate-annotations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pieceId }),
  });

  let json: unknown;

  try {
    json = await response.json();
  } catch {
    throw new Error("Failed to generate annotations");
  }

  if (!response.ok) {
    const error =
      typeof json === "object" &&
      json !== null &&
      "error" in json &&
      typeof json.error === "string"
        ? json.error
        : "Failed to generate annotations";

    throw new Error(error);
  }

  const parsed = generateAnnotationsApiResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Invalid annotation response");
  }

  return parsed.data.annotations;
}
