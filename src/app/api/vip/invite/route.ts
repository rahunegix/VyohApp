import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  redeemVipInviteCode,
  userHasRedeemedVipInvite,
  validateVipInviteCode,
} from "@/lib/platform/vip-access";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const redeemed = await userHasRedeemedVipInvite(admin, auth.user.id as string);
  return NextResponse.json({ success: true, data: { redeemed } });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { code, action } = await request.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ success: false, error: "Invite code required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const userId = auth.user.id as string;

  if (action === "validate") {
    const result = await validateVipInviteCode(admin, code);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: { valid: true } });
  }

  const result = await redeemVipInviteCode(admin, userId, code);
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: { redeemed: true } });
}
