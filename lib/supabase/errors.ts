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

  return "Failed to connect to Supabase";
}

/** PostgREST PGRST303 — local clock ahead of Supabase, or a stale cached JWT. */
export function isJwtClockSkewError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  return (
    code === "PGRST303" ||
    message.includes("jwt issued at future") ||
    message.includes("issued at future")
  );
}

export function getSupabaseSetupHint(message: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes("anonymous") && lower.includes("disabled")) {
    return "Enable anonymous sign-ins in Supabase → Authentication → Providers.";
  }

  if (
    lower.includes("relation") &&
    lower.includes("does not exist")
  ) {
    return "Run supabase/migrations/001_initial.sql in the Supabase SQL Editor.";
  }

  if (lower.includes("invalid api key") || lower.includes("invalid jwt")) {
    return "Check that NEXT_PUBLIC_SUPABASE_ANON_KEY is your publishable (anon) key, not the secret key.";
  }

  if (
    lower.includes("jwt issued at future") ||
    lower.includes("issued at future")
  ) {
    return "Your system clock may be ahead of real time. Set Windows time to automatic, then clear site data for localhost and refresh.";
  }

  if (lower.includes("missing next_public_supabase")) {
    return "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart the dev server.";
  }

  return null;
}
