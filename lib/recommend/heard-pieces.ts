import "server-only";

import { createServiceClient } from "@/lib/supabase/server";

/** Piece ids this user has already started listening to. */
export async function getHeardPieceIds(userId: string): Promise<Set<string>> {
  const heard = new Set<string>();
  const supabase = createServiceClient();

  if (!supabase) {
    return heard;
  }

  const { data, error } = await supabase
    .from("listening_sessions")
    .select("piece_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load heard pieces:", error.message);
    return heard;
  }

  for (const row of data ?? []) {
    if (typeof row.piece_id === "string" && row.piece_id) {
      heard.add(row.piece_id);
    }
  }

  return heard;
}
