import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthProfileId, getAuthUser } from "@/lib/auth/api-auth";
import { assertCanSendInterest } from "@/lib/verification/interest-limit";
import {
  getActiveSubscription,
  isPaidPlanId,
  normalizePlanId,
} from "@/lib/subscription/service";

function mapProfileRow(row: Record<string, unknown>) {
  const photos = (row.profile_photos as Record<string, unknown>[] | undefined) ?? [];
  return {
    ...row,
    photos: photos.sort((a, b) => (a.sort_order as number) - (b.sort_order as number)),
  };
}

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  const profileId = await getAuthProfileId(request);
  if (!profileId || !auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const sub = await getActiveSubscription(admin, auth.user.id);
  const isPaid = isPaidPlanId(normalizePlanId(sub?.subscription_plans?.name));
  const direction = new URL(request.url).searchParams.get("direction");

  const blurProfile = (row: Record<string, unknown>) => {
    if (isPaid) return row;
    return {
      ...row,
      full_name: "Someone",
      bio: null,
      ai_bio: null,
      profile_photos: [],
      photos: [],
    };
  };

  const mapRows = (rows: Record<string, unknown>[], dir: "sent" | "received") =>
    rows.map((row) => {
      if (dir === "received" && !isPaid) {
        const sender = row.sender as Record<string, unknown> | undefined;
        if (sender) {
          return { ...row, sender: blurProfile(sender) };
        }
      }
      return row;
    });

  if (direction === "sent") {
    const { data } = await admin
      .from("likes")
      .select("*, receiver:profiles!likes_receiver_profile_id_fkey(*, profile_photos(*))")
      .eq("sender_profile_id", profileId)
      .order("created_at", { ascending: false });
    return NextResponse.json({
      success: true,
      data: mapRows((data ?? []) as Record<string, unknown>[], "sent"),
      is_paid: isPaid,
    });
  }

  if (direction === "received") {
    const { data } = await admin
      .from("likes")
      .select("*, sender:profiles!likes_sender_profile_id_fkey(*, profile_photos(*))")
      .eq("receiver_profile_id", profileId)
      .order("created_at", { ascending: false });
    return NextResponse.json({
      success: true,
      data: mapRows((data ?? []) as Record<string, unknown>[], "received"),
      is_paid: isPaid,
    });
  }

  const [sentRes, receivedRes] = await Promise.all([
    admin
      .from("likes")
      .select("*, receiver:profiles!likes_receiver_profile_id_fkey(*, profile_photos(*))")
      .eq("sender_profile_id", profileId)
      .order("created_at", { ascending: false }),
    admin
      .from("likes")
      .select("*, sender:profiles!likes_sender_profile_id_fkey(*, profile_photos(*))")
      .eq("receiver_profile_id", profileId)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      sent: sentRes.data ?? [],
      received: mapRows((receivedRes.data ?? []) as Record<string, unknown>[], "received"),
    },
    is_paid: isPaid,
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  const profileId = await getAuthProfileId(request);
  if (!profileId || !auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { targetProfileId } = await request.json();
  if (!targetProfileId) {
    return NextResponse.json({ success: false, error: "targetProfileId required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("platform, cross_platform_visible")
    .eq("id", targetProfileId)
    .maybeSingle();

  const { data: senderProfile } = await admin
    .from("profiles")
    .select("platform")
    .eq("id", profileId)
    .maybeSingle();

  const senderPlatform = senderProfile?.platform ?? auth.platform;
  const targetPlatform = targetProfile?.platform;

  if (
    targetPlatform &&
    senderPlatform !== targetPlatform &&
    !targetProfile?.cross_platform_visible
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "You can only connect with profiles on the same platform",
        code: "PLATFORM_MISMATCH",
      },
      { status: 403 }
    );
  }

  const [{ data: existingLike }, { data: verification }] = await Promise.all([
    admin
      .from("likes")
      .select("id")
      .eq("sender_profile_id", profileId)
      .eq("receiver_profile_id", targetProfileId)
      .maybeSingle(),
    admin
      .from("verification_status")
      .select("face_verified")
      .eq("profile_id", profileId)
      .maybeSingle(),
  ]);

  if (!existingLike) {
    const gate = await assertCanSendInterest(
      admin,
      profileId,
      Boolean(verification?.face_verified),
      auth.user.id
    );
    if (!gate.allowed) {
      return NextResponse.json(
        { success: false, error: gate.error, code: gate.code },
        { status: 403 }
      );
    }
  }

  const { data: like, error: likeError } = await admin
    .from("likes")
    .upsert(
      { sender_profile_id: profileId, receiver_profile_id: targetProfileId },
      { onConflict: "sender_profile_id,receiver_profile_id" }
    )
    .select("*")
    .single();

  if (likeError) {
    return NextResponse.json({ success: false, error: likeError.message }, { status: 400 });
  }

  const { data: mutual } = await admin
    .from("likes")
    .select("*")
    .eq("sender_profile_id", targetProfileId)
    .eq("receiver_profile_id", profileId)
    .maybeSingle();

  let match = null;
  if (mutual) {
    const { data: matchRow } = await admin
      .from("matches")
      .upsert(
        {
          profile_a_id: profileId,
          profile_b_id: targetProfileId,
          match_status: "active",
        },
        { onConflict: "profile_a_id,profile_b_id" }
      )
      .select("*")
      .single();
    match = matchRow;
  }

  return NextResponse.json({ success: true, data: { like, match, mutual: !!mutual } });
}

export async function DELETE(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const targetProfileId = new URL(request.url).searchParams.get("targetProfileId");
  if (!targetProfileId) {
    return NextResponse.json({ success: false, error: "targetProfileId required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("likes")
    .delete()
    .eq("sender_profile_id", profileId)
    .eq("receiver_profile_id", targetProfileId);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
