import { ApiAuthError } from "@/lib/api/require-auth";

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

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

function hitBucket(
  key: string,
  limit: number,
  windowMs: number,
): void {
  const now = Date.now();
  const current = rateLimitBuckets.get(key);

  if (!current || now >= current.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
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

export function enforceRateLimits(
  request: Request,
  userId: string,
  action: RateLimitedAction,
): void {
  const config = RATE_LIMITS[action];
  const ip = getRequestIp(request);

  hitBucket(`user:${userId}:${action}`, config.user.limit, config.user.windowMs);
  hitBucket(`ip:${ip}:${action}`, config.ip.limit, config.ip.windowMs);
}
