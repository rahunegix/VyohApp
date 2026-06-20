import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";

export async function requireAdminApi(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user || auth.user.role !== "admin") {
    return { error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { auth, admin: auth };
}
