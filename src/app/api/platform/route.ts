import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/api-auth";
import { PLATFORM_COOKIE, isPlatform, type Platform } from "@/lib/platform";
import { createPlatformProfile } from "@/lib/platform/service";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, platform, profile_status, full_name, cross_platform_visible")
    .eq("user_id", auth.user.id);

  return NextResponse.json({
    success: true,
    data: {
      active_platform: auth.platform,
      platforms: auth.platforms,
      profiles: profiles ?? [],
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const action = String(body.action ?? "switch");
  const admin = createAdminClient();

  if (action === "create") {
    const platform = body.platform as Platform;
    if (!isPlatform(platform)) {
      return NextResponse.json({ success: false, error: "Invalid platform" }, { status: 400 });
    }
    await createPlatformProfile(admin, auth.user.id as string, platform);
    await admin
      .from("users")
      .update({ active_platform: platform, updated_at: new Date().toISOString() })
      .eq("id", auth.user.id);

    const response = NextResponse.json({ success: true, data: { platform } });
    response.cookies.set(PLATFORM_COOKIE, platform, { path: "/", maxAge: 365 * 24 * 60 * 60 });
    return response;
  }

  if (action === "visibility") {
    const visible = Boolean(body.cross_platform_visible);
    if (!auth.profile?.id) {
      return NextResponse.json({ success: false, error: "No active profile" }, { status: 400 });
    }
    await admin
      .from("profiles")
      .update({ cross_platform_visible: visible, updated_at: new Date().toISOString() })
      .eq("id", auth.profile.id);
    return NextResponse.json({ success: true, data: { cross_platform_visible: visible } });
  }

  const platform = body.platform as Platform;
  if (!isPlatform(platform)) {
    return NextResponse.json({ success: false, error: "Invalid platform" }, { status: 400 });
  }

  const { data: target } = await admin
    .from("profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("platform", platform)
    .maybeSingle();

  if (!target?.id) {
    return NextResponse.json(
      { success: false, error: "Profile not set up for this platform", code: "PROFILE_MISSING" },
      { status: 404 }
    );
  }

  await admin
    .from("users")
    .update({ active_platform: platform, updated_at: new Date().toISOString() })
    .eq("id", auth.user.id);

  const response = NextResponse.json({
    success: true,
    data: { platform, profile_id: target.id },
  });
  response.cookies.set(PLATFORM_COOKIE, platform, { path: "/", maxAge: 365 * 24 * 60 * 60 });
  return response;
}
