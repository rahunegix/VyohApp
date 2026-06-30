import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthProfileId, getAuthUser } from "@/lib/auth/api-auth";
import {
  getActiveSubscription,
  getContactDetailsForProfile,
  hasContactUnlock,
  unlockContactForUser,
  normalizePlanId,
  isPaidPlanId,
  maskPhone,
  formatDisplayPhone,
} from "@/lib/subscription/service";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const targetProfileId = new URL(request.url).searchParams.get("targetProfileId");
  if (!targetProfileId) {
    return NextResponse.json({ success: false, error: "targetProfileId required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const sub = await getActiveSubscription(admin, auth.user.id);
  const planId = normalizePlanId(sub?.subscription_plans?.name);
  const isPaid = Boolean(sub && isPaidPlanId(planId));

  const unlocked = isPaid
    ? await hasContactUnlock(admin, auth.user.id, targetProfileId)
    : false;

  let contact: {
    phone?: string;
    phone_display?: string;
    phone_masked?: string;
    full_name: string;
    city?: string | null;
  } | null = null;

  if (unlocked) {
    const details = await getContactDetailsForProfile(admin, profileId, targetProfileId);
    if (details) {
      contact = {
        phone: details.phone,
        phone_display: formatDisplayPhone(details.phone),
        full_name: details.full_name,
        city: details.city,
      };
    }
  } else if (isPaid) {
    const preview = await getContactDetailsForProfile(admin, profileId, targetProfileId);
    if (preview) {
      contact = {
        phone_masked: maskPhone(preview.phone),
        full_name: preview.full_name,
        city: preview.city,
      };
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      unlocked,
      is_paid: isPaid,
      credits_remaining: sub?.call_credits_remaining ?? 0,
      contact,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { targetProfileId } = await request.json();
  if (!targetProfileId) {
    return NextResponse.json({ success: false, error: "targetProfileId required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await unlockContactForUser(
    admin,
    auth.user.id,
    profileId,
    targetProfileId
  );

  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error, code: result.code },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      newly_unlocked: result.newly_unlocked,
      credits_remaining: result.credits_remaining,
      contact: {
        phone: result.details.phone,
        phone_display: formatDisplayPhone(result.details.phone),
        full_name: result.details.full_name,
        city: result.details.city,
      },
    },
  });
}
