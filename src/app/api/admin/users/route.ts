import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";
import { hashValue, normalizePhoneStorage } from "@/lib/auth/session";
import { adminUserPayloadSchema } from "@/lib/admin/user-profile-schema";
import { applyAdminProfilePayload } from "@/lib/admin/apply-profile-payload";

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  let query = admin
    .from("users")
    .select(
      "id, phone, email, role, is_active, created_at, updated_at, profiles(id, full_name, profile_status, city, intent, trust_score)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    query = query.or(`phone.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  try {
    const body = adminUserPayloadSchema.parse(await request.json());
    const email = body.email?.trim().toLowerCase() || null;
    const phone = body.phone?.trim() ? normalizePhoneStorage(body.phone) : null;

    if (!email && !phone) {
      return NextResponse.json({ success: false, error: "Email or phone is required" }, { status: 400 });
    }

    if (body.role === "admin" && (!email || !body.password)) {
      return NextResponse.json(
        { success: false, error: "Admin users require email and password" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    if (email) {
      const { data: existingEmail } = await admin.from("users").select("id").eq("email", email).maybeSingle();
      if (existingEmail) {
        return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
      }
    }

    if (phone) {
      const { data: existingPhone } = await admin.from("users").select("id").eq("phone", phone).maybeSingle();
      if (existingPhone) {
        return NextResponse.json({ success: false, error: "Phone already in use" }, { status: 400 });
      }
    }

    const insert: Record<string, unknown> = {
      email,
      phone,
      role: body.role ?? "user",
      is_active: body.is_active ?? true,
    };

    if (body.password) {
      insert.password_hash = await hashValue(body.password);
    }

    const { data: user, error } = await admin.from("users").insert(insert).select("*").single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    await applyAdminProfilePayload(admin, user.id, body.profile);

    const { data: full } = await admin
      .from("users")
      .select("*, profiles(*, profile_photos(*), verification_status(*))")
      .eq("id", user.id)
      .single();

    return NextResponse.json({ success: true, data: full });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
