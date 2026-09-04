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

export function apiAuthErrorResponse(error: unknown) {
  if (error instanceof ApiAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  return null;
}
