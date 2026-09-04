import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

/** Service-role client for shared cache / rate limits (bypasses RLS). */
export function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!serviceClient) {
    serviceClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serviceClient;
}

export function requireServiceClient(): SupabaseClient {
  const client = createServiceClient();
  if (!client) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for durable AI cache and rate limits",
    );
  }
  return client;
}
