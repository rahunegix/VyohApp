import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const status = new URL(request.url).searchParams.get("status") ?? "pending";
  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select(
      "id, user_id, full_name, city, profession, bio, vip_approval_status, vip_details, vip_invite_code, profile_status, created_at, profile_photos(url, is_primary), users(phone, email)"
    )
    .eq("platform", "vip")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("vip_approval_status", status);
  }

  const { data, error } = await query.limit(100);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const { profileId, status, admin_notes } = await request.json();
  if (!profileId || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const patch: Record<string, unknown> = {
    vip_approval_status: status,
    updated_at: new Date().toISOString(),
  };

  if (status === "approved") {
    patch.profile_status = "active";
  } else if (status === "rejected") {
    patch.profile_status = "hidden";
  }

  if (admin_notes !== undefined) {
    patch.admin_notes = admin_notes;
  }

  const { data, error } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", profileId)
    .eq("platform", "vip")
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
