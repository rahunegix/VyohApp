import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/api-auth";

export async function PATCH(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user || auth.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { requestId, status } = await request.json();
  if (!requestId || !["verified", "rejected", "pending_review"].includes(status)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: idRequest, error } = await admin
    .from("id_verification_requests")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select("profile_id")
    .single();

  if (error || !idRequest) {
    return NextResponse.json({ success: false, error: error?.message || "Not found" }, { status: 404 });
  }

  if (status === "verified") {
    await admin
      .from("verification_status")
      .update({ id_verified: true, updated_at: new Date().toISOString() })
      .eq("profile_id", idRequest.profile_id);
  }

  return NextResponse.json({ success: true });
}
