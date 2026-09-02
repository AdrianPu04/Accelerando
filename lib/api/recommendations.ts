import { getAuthHeaders } from "@/lib/api/auth";
import { recommendStreamEventSchema } from "@/lib/schemas/recommendation";
import type { RecommendNextRequest, RecommendStreamEvent } from "@/lib/schemas/recommendation";
import { formatAiError } from "@/lib/user-messages";
import type { Piece } from "@/types";

function parseStreamLine(line: string): RecommendStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const json: unknown = JSON.parse(trimmed);
    const parsed = recommendStreamEventSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function handleStreamEvent(
  event: RecommendStreamEvent,
  handlers: {
    onPiece: (piece: Piece) => void;
    onDelta: (text: string) => void;
    onDone: () => void;
    onError: (message: string) => void;
  },
  state: { sawDone: boolean; sawError: boolean; receivedContent: boolean },
): void {
  switch (event.type) {
    case "piece":
      handlers.onPiece(event.piece);
      break;
    case "delta":
      state.receivedContent = true;
      handlers.onDelta(event.text);
      break;
    case "done":
      state.sawDone = true;
      handlers.onDone();
      break;
    case "error":
      state.sawError = true;
      handlers.onError(formatAiError(event.message).description);
      break;
  }
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
  const headers = await getAuthHeaders();
  const response = await fetch("/api/recommend-next", {
    method: "POST",
    headers,
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

    handlers.onError(formatAiError(message).description);
    return;
  }

  if (!response.body) {
    handlers.onError("No response body");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const state = { sawDone: false, sawError: false, receivedContent: false };

  const processLine = (line: string) => {
    const event = parseStreamLine(line);
    if (!event) {
      return;
    }

    handleStreamEvent(event, handlers, state);
  };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        processLine(line);
      }
    }

    if (buffer.trim()) {
      processLine(buffer);
    }

    if (state.sawError) {
      return;
    }

    if (!state.sawDone) {
      if (state.receivedContent) {
        handlers.onDone();
      } else {
        handlers.onError("Recommendation stream ended unexpectedly");
      }
    }
  } catch (error) {
    if (signal?.aborted) {
      return;
    }

    const message =
      error instanceof Error ? error.message : "Failed to read recommendation";

    if (!state.sawError) {
      handlers.onError(message);
    }
  }
}
