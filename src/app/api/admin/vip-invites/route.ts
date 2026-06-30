import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";

function generateCode() {
  return `VIP-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vip_invite_codes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const body = await request.json();
  const admin = createAdminClient();
  const code = (body.code as string | undefined)?.trim().toUpperCase() || generateCode();
  const maxUses = Math.max(1, Number(body.max_uses ?? 1));
  const label = body.label ? String(body.label) : null;
  const expiresAt = body.expires_at ? String(body.expires_at) : null;
  const userId = guard.auth.user.id as string;

  const { data, error } = await admin
    .from("vip_invite_codes")
    .insert({
      code,
      label,
      max_uses: maxUses,
      expires_at: expiresAt,
      created_by: userId,
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const { id, active, max_uses, label, expires_at } = await request.json();
  if (!id) {
    return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (active !== undefined) patch.active = Boolean(active);
  if (max_uses !== undefined) patch.max_uses = Number(max_uses);
  if (label !== undefined) patch.label = label;
  if (expires_at !== undefined) patch.expires_at = expires_at;

  const { data, error } = await admin
    .from("vip_invite_codes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
