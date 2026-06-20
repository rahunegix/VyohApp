import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { profiles, ...user } = auth.user as Record<string, unknown>;
  const profile = auth.profile ?? (Array.isArray(profiles) ? profiles[0] : profiles);

  return NextResponse.json({
    success: true,
    data: { user, profile },
  });
}
