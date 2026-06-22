import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthProfileId, getAuthUser } from "@/lib/auth/api-auth";
import {
  insertProfilePhotoRow,
  MAX_PROFILE_PHOTO_BYTES,
  syncProfilePhotoUrls,
  uploadProfilePhotoFile,
} from "@/lib/profiles/upload-profile-photo";

export async function GET(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profile_photos")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  const profileId = await getAuthProfileId(request);
  if (!auth?.user?.id || !profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ success: false, error: "File must be an image" }, { status: 400 });
  }

  if (file.size > MAX_PROFILE_PHOTO_BYTES) {
    return NextResponse.json({ success: false, error: "Image must be under 8MB" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { count } = await admin
    .from("profile_photos")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId);

  if ((count ?? 0) >= 6) {
    return NextResponse.json({ success: false, error: "Maximum 6 photos allowed" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadProfilePhotoFile(admin, auth.user.id, buffer, file.type);
    const row = await insertProfilePhotoRow(admin, profileId, url, count ?? 0);
    return NextResponse.json({ success: true, data: row });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const photos = Array.isArray(body.photos) ? (body.photos as string[]) : null;
  if (!photos) {
    return NextResponse.json({ success: false, error: "photos array required" }, { status: 400 });
  }

  const httpPhotos = photos.filter((url) => /^https?:\/\//i.test(url)).slice(0, 6);
  const admin = createAdminClient();

  try {
    const data = await syncProfilePhotoUrls(admin, profileId, httpPhotos);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Sync failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url).searchParams.get("url");
  if (!url) {
    return NextResponse.json({ success: false, error: "url required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profile_photos")
    .delete()
    .eq("profile_id", profileId)
    .eq("url", url);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
