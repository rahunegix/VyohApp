import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthProfileId, getAuthUser } from "@/lib/auth/api-auth";
import { DEMO_PROFILES } from "@/services/demo-data";
import { hasVipPlatformAccess } from "@/lib/platform/vip-access";

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
  const viewerPlatform = (profile?.platform as string) ?? auth.platform ?? "dating";

  if (viewerPlatform === "vip") {
    const vipAccess = await hasVipPlatformAccess(
      admin,
      auth.user.id as string,
      profile as Record<string, unknown>
    );
    if (!vipAccess) {
      return NextResponse.json({
        success: true,
        data: [],
        vip_required: true,
        demo: false,
      });
    }
  }

  let query = admin
    .from("profiles")
    .select("*, profile_photos(*), verification_status(*)")
    .eq("profile_status", "active")
    .neq("user_id", auth.user.id)
    .or(
      `platform.eq.${viewerPlatform},and(platform.neq.${viewerPlatform},cross_platform_visible.eq.true)`
    );

  if (viewerPlatform === "vip") {
    query = admin
      .from("profiles")
      .select("*, profile_photos(*), verification_status(*)")
      .eq("profile_status", "active")
      .eq("platform", "vip")
      .eq("vip_approval_status", "approved")
      .neq("user_id", auth.user.id);
  }

  if (gender && lookingFor && lookingFor !== "everyone") {
    query = query.eq("gender", lookingFor);
  }

  const { data, error } = await query.limit(50);

  const samePlatform = (data ?? []).filter(
    (row) => (row as Record<string, unknown>).platform === viewerPlatform
  );
  const crossVisible =
    viewerPlatform === "vip"
      ? []
      : (data ?? []).filter(
          (row) =>
            (row as Record<string, unknown>).platform !== viewerPlatform &&
            (row as Record<string, unknown>).cross_platform_visible === true
        );

  const merged = [...samePlatform, ...crossVisible];

  if (error || !merged.length) {
    return NextResponse.json({
      success: true,
      data: [],
      demo: false,
    });
  }

  return NextResponse.json({
    success: true,
    data: merged.map((row) => mapProfile(row as Record<string, unknown>)),
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
    .eq("platform", auth.platform)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
