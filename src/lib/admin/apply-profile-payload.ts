import type { SupabaseClient } from "@supabase/supabase-js";
import { buildProfileUpdate, type AdminProfilePayload } from "@/lib/admin/user-profile-schema";

export async function applyAdminProfilePayload(
  admin: SupabaseClient,
  userId: string,
  payload?: AdminProfilePayload
) {
  if (!payload) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let profileId = profile?.id;

  if (!profileId) {
    const { data: created, error: createError } = await admin
      .from("profiles")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (createError) throw new Error(createError.message);
    profileId = created.id;
    await admin.from("verification_status").insert({ profile_id: profileId });
  }

  const profileUpdate = buildProfileUpdate(payload);
  const { data: updatedProfile, error } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const verificationPatch: Record<string, boolean> = {};
  if (payload.mobile_verified !== undefined) verificationPatch.mobile_verified = payload.mobile_verified;
  if (payload.face_verified !== undefined) verificationPatch.face_verified = payload.face_verified;
  if (payload.id_verified !== undefined) verificationPatch.id_verified = payload.id_verified;
  if (payload.family_verified !== undefined) verificationPatch.family_verified = payload.family_verified;

  if (Object.keys(verificationPatch).length) {
    await admin
      .from("verification_status")
      .update({ ...verificationPatch, updated_at: new Date().toISOString() })
      .eq("profile_id", profileId);
  }

  if (payload.photo_urls !== undefined) {
    await admin.from("profile_photos").delete().eq("profile_id", profileId);
    const urls = payload.photo_urls.filter((url) => url.trim());
    if (urls.length) {
      await admin.from("profile_photos").insert(
        urls.map((url, i) => ({
          profile_id: profileId,
          url: url.trim(),
          sort_order: i,
          is_primary: i === 0,
          is_private: false,
        }))
      );
    }
  }

  return updatedProfile;
}
