import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/admin/guard";

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi(request);
  if ("error" in guard && guard.error) return guard.error;

  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  let query = admin
    .from("profiles")
    .select(
      "*, users(id, phone, email, role, is_active), verification_status(*), profile_photos(id, url, is_primary)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("profile_status", status);
  if (q) query = query.or(`full_name.ilike.%${q}%,city.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
