import "server-only";

import { ApiAuthError } from "@/lib/api/require-auth";
import { createServiceClient } from "@/lib/supabase/server";

const RATE_LIMITS = {
  annotations: {
    user: { limit: 15, windowMs: 60 * 60 * 1000 },
    ip: { limit: 40, windowMs: 60 * 60 * 1000 },
  },
  recommendations: {
    user: { limit: 12, windowMs: 60 * 60 * 1000 },
    ip: { limit: 30, windowMs: 60 * 60 * 1000 },
  },
} as const;

export type RateLimitedAction = keyof typeof RATE_LIMITS;

/** In-memory fallback when service role / RPC is unavailable (local only). */
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function hitMemoryBucket(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const current = memoryBuckets.get(key);

  if (!current || now >= current.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
    throw new ApiAuthError(
      `Rate limit exceeded. Try again in ${retryAfterSeconds}s.`,
      429,
    );
  }

  current.count += 1;
}

async function hitDurableBucket(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) {
    hitMemoryBucket(key, limit, windowMs);
    return false;
  }

  const { data, error } = await supabase.rpc("hit_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_ms: windowMs,
  });

  if (error) {
    console.error("Durable rate limit failed, using memory fallback:", error.message);
    hitMemoryBucket(key, limit, windowMs);
    return false;
  }

  const result = data as {
    allowed?: boolean;
    retry_after_ms?: number;
  } | null;

  if (!result?.allowed) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((result?.retry_after_ms ?? 60_000) / 1000),
    );
    throw new ApiAuthError(
      `Rate limit exceeded. Try again in ${retryAfterSeconds}s.`,
      429,
    );
  }

  return true;
}

export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function enforceRateLimits(
  request: Request,
  userId: string,
  action: RateLimitedAction,
): Promise<void> {
  const config = RATE_LIMITS[action];
  const ip = getRequestIp(request);

  await hitDurableBucket(
    `user:${userId}:${action}`,
    config.user.limit,
    config.user.windowMs,
  );
  await hitDurableBucket(
    `ip:${ip}:${action}`,
    config.ip.limit,
    config.ip.windowMs,
  );
}
