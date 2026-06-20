import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/api-auth";

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { fcmToken } = await request.json();
  if (!fcmToken) {
    return NextResponse.json({ success: false, error: "fcmToken required" }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin.from("users").update({ fcm_token: fcmToken }).eq("id", auth.user.id);

  return NextResponse.json({ success: true });
}
