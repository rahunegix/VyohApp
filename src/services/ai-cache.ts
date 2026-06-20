import { createAdminClient } from "@/lib/supabase/admin";
import { getServerAuth } from "@/lib/auth/server-auth";

type CacheTable =
  | "ai_profile_summaries"
  | "ai_compatibility"
  | "ai_readiness"
  | "ai_recommendations"
  | "ai_conversation_starters"
  | "ai_match_explanations"
  | "ai_trust_scores";

export async function getCachedAI<T>(
  table: CacheTable,
  match: Record<string, string>
): Promise<{ data: T; model: string } | null> {
  const admin = createAdminClient();
  let query = admin.from(table).select("json_result, model_used");

  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }

  const { data } = await query.maybeSingle();
  if (!data) return null;
  return { data: data.json_result as T, model: data.model_used };
}

export async function setCachedAI(
  table: CacheTable,
  row: Record<string, unknown>,
  jsonResult: Record<string, unknown>,
  model: string
) {
  const admin = createAdminClient();
  await admin.from(table).upsert(
    { ...row, json_result: jsonResult, model_used: model, updated_at: new Date().toISOString() },
    { onConflict: table === "ai_compatibility" ? "profile_a_id,profile_b_id" : undefined }
  );
}

export async function getAuthIds() {
  const auth = await getServerAuth();
  if (!auth?.user) return null;

  return {
    authUserId: auth.user.id,
    userId: auth.user.id,
    profileId: auth.profile?.id,
  };
}
