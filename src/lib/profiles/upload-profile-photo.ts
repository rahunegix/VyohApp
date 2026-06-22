import type { SupabaseClient } from "@supabase/supabase-js";

export const PROFILE_PHOTOS_BUCKET = "profile-photos-public";
export const MAX_PROFILE_PHOTO_BYTES = 8 * 1024 * 1024;

export async function uploadProfilePhotoFile(
  admin: SupabaseClient,
  userId: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; path: string }> {
  const ext = contentType === "image/png" ? "png" : "jpg";
  const path = `${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error: uploadError } = await admin.storage.from(PROFILE_PHOTOS_BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = admin.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(path);
  return { url: publicUrl.publicUrl, path };
}

export async function insertProfilePhotoRow(
  admin: SupabaseClient,
  profileId: string,
  url: string,
  sortOrder: number
) {
  const { data, error } = await admin
    .from("profile_photos")
    .insert({
      profile_id: profileId,
      url,
      sort_order: sortOrder,
      is_primary: sortOrder === 0,
      is_private: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function syncProfilePhotoUrls(
  admin: SupabaseClient,
  profileId: string,
  urls: string[]
) {
  await admin.from("profile_photos").delete().eq("profile_id", profileId);
  if (!urls.length) return [];

  const { data, error } = await admin
    .from("profile_photos")
    .insert(
      urls.map((url, i) => ({
        profile_id: profileId,
        url,
        sort_order: i,
        is_primary: i === 0,
        is_private: false,
      }))
    )
    .select("*");

  if (error) throw new Error(error.message);
  return data ?? [];
}
