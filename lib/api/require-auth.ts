import { createClient } from "@supabase/supabase-js";

export class ApiAuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiAuthError";
  }
}

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS = {
  annotations: { limit: 30, windowMs: 60 * 60 * 1000 },
  recommendations: { limit: 20, windowMs: 60 * 60 * 1000 },
} as const;

type RateLimitedAction = keyof typeof RATE_LIMITS;

function getSupabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new ApiAuthError("Supabase is not configured", 500);
  }

  return createClient(url, key);
}

export async function requireApiUser(request: Request): Promise<{ userId: string }> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiAuthError("Unauthorized", 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    throw new ApiAuthError("Unauthorized", 401);
  }

  const supabase = getSupabaseAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new ApiAuthError("Unauthorized", 401);
  }

  return { userId: user.id };
}

export function enforceRateLimit(
  userId: string,
  action: RateLimitedAction,
): void {
  const { limit, windowMs } = RATE_LIMITS[action];
  const key = `${userId}:${action}`;
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

export function apiAuthErrorResponse(error: unknown) {
  if (error instanceof ApiAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  return null;
}
