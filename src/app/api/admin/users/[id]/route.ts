import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";
import { hashValue, normalizePhoneStorage } from "@/lib/auth/session";
import { adminUserPayloadSchema } from "@/lib/admin/user-profile-schema";
import { applyAdminProfilePayload } from "@/lib/admin/apply-profile-payload";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("users")
    .select("*, profiles(*, profile_photos(*), verification_status(*))")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const { id } = await params;

  try {
    const body = adminUserPayloadSchema.parse(await request.json());
    const admin = createAdminClient();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.email !== undefined) {
      updates.email = body.email.trim().toLowerCase() || null;
    }
    if (body.phone !== undefined) {
      updates.phone = body.phone.trim() ? normalizePhoneStorage(body.phone) : null;
    }
    if (body.role !== undefined) updates.role = body.role;
    if (body.is_active !== undefined) {
      updates.is_active = body.is_active;
      if (!body.is_active) {
        updates.access_token = null;
        updates.refresh_token_hash = null;
        updates.token_expires_at = null;
      }
    }
    if (body.password) {
      updates.password_hash = await hashValue(body.password);
    }

    const { data, error } = await admin.from("users").update(updates).eq("id", id).select("*").single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    await applyAdminProfilePayload(admin, id, body.profile);

    const { data: full } = await admin
      .from("users")
      .select("*, profiles(*, profile_photos(*), verification_status(*))")
      .eq("id", id)
      .single();

    return NextResponse.json({ success: true, data: full });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const { id } = await params;

  if (guard.auth?.user?.id === id) {
    return NextResponse.json({ success: false, error: "Cannot delete your own account" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("users").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
