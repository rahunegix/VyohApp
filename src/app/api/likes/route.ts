import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthProfileId } from "@/lib/auth/api-auth";

function mapProfileRow(row: Record<string, unknown>) {
  const photos = (row.profile_photos as Record<string, unknown>[] | undefined) ?? [];
  return {
    ...row,
    photos: photos.sort((a, b) => (a.sort_order as number) - (b.sort_order as number)),
  };
}

export async function GET(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const direction = new URL(request.url).searchParams.get("direction");

  if (direction === "sent") {
    const { data } = await admin
      .from("likes")
      .select("*, receiver:profiles!likes_receiver_profile_id_fkey(*, profile_photos(*))")
      .eq("sender_profile_id", profileId)
      .order("created_at", { ascending: false });
    return NextResponse.json({ success: true, data: data ?? [] });
  }

  if (direction === "received") {
    const { data } = await admin
      .from("likes")
      .select("*, sender:profiles!likes_sender_profile_id_fkey(*, profile_photos(*))")
      .eq("receiver_profile_id", profileId)
      .order("created_at", { ascending: false });
    return NextResponse.json({ success: true, data: data ?? [] });
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
      received: receivedRes.data ?? [],
    },
  });
}

export async function POST(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { targetProfileId } = await request.json();
  if (!targetProfileId) {
    return NextResponse.json({ success: false, error: "targetProfileId required" }, { status: 400 });
  }

  const admin = createAdminClient();

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
