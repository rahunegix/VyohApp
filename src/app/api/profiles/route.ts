import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthProfileId, getAuthUser } from "@/lib/auth/api-auth";
import { DEMO_PROFILES } from "@/services/demo-data";

function mapProfile(row: Record<string, unknown>) {
  const photos = (row.profile_photos as Record<string, unknown>[] | undefined) ?? [];
  return {
    ...row,
    photos: photos.sort((a, b) => (a.sort_order as number) - (b.sort_order as number)),
  };
}

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const { data } = await admin
      .from("profiles")
      .select("*, profile_photos(*), verification_status(*)")
      .eq("id", id)
      .eq("profile_status", "active")
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: mapProfile(data as Record<string, unknown>) });
  }

  if (!auth?.profile) {
    return NextResponse.json({ success: true, data: DEMO_PROFILES, demo: true });
  }

  const profile = Array.isArray(auth.profile) ? auth.profile[0] : auth.profile;
  const gender = profile?.gender;
  const lookingFor = profile?.looking_for;

  let query = admin
    .from("profiles")
    .select("*, profile_photos(*), verification_status(*)")
    .eq("profile_status", "active")
    .neq("user_id", auth.user.id);

  if (gender && lookingFor && lookingFor !== "everyone") {
    query = query.eq("gender", lookingFor);
  }

  const { data, error } = await query.limit(50);

  if (error || !data?.length) {
    return NextResponse.json({
      success: true,
      data: DEMO_PROFILES.filter((p) => p.id !== profile?.id),
      demo: true,
    });
  }

  return NextResponse.json({
    success: true,
    data: data.map((row) => mapProfile(row as Record<string, unknown>)),
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("user_id", auth.user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
