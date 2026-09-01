import type { Piece } from "@/types";

import type { RecommendNextRequest } from "@/lib/schemas/recommendation";

export type RecommendStreamEvent =
  | { type: "piece"; piece: Piece; provider: string }
  | { type: "delta"; text: string }
  | { type: "done"; provider: string }
  | { type: "error"; message: string };

function parseStreamLine(line: string): RecommendStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  return JSON.parse(trimmed) as RecommendStreamEvent;
}

export async function streamRecommendation(
  input: RecommendNextRequest,
  handlers: {
    onPiece: (piece: Piece) => void;
    onDelta: (text: string) => void;
    onDone: () => void;
    onError: (message: string) => void;
  },
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch("/api/recommend-next", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });

  if (!response.ok) {
    let message = "Failed to generate recommendation";

    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) {
        message = data.error;
      }
    } catch {
      // Response was not JSON.
    }

    handlers.onError(message);
    return;
  }

  if (!response.body) {
    handlers.onError("No response body");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const event = parseStreamLine(line);
      if (!event) {
        continue;
      }

      switch (event.type) {
        case "piece":
          handlers.onPiece(event.piece);
          break;
        case "delta":
          handlers.onDelta(event.text);
          break;
        case "done":
          handlers.onDone();
          break;
        case "error":
          handlers.onError(event.message);
          break;
      }
    }
  }

  if (buffer.trim()) {
    const event = parseStreamLine(buffer);
    if (event?.type === "done") {
      handlers.onDone();
    } else if (event?.type === "error") {
      handlers.onError(event.message);
    }
  }
}
