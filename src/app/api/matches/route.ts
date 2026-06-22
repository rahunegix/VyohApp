import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthProfileId, getAuthUser } from "@/lib/auth/api-auth";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: true, data: [] });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("matches")
    .select(`
      *,
      profile_a:profiles!matches_profile_a_id_fkey(*, profile_photos(*)),
      profile_b:profiles!matches_profile_b_id_fkey(*, profile_photos(*))
    `)
    .or(`profile_a_id.eq.${profileId},profile_b_id.eq.${profileId}`)
    .eq("match_status", "active");

  const mapped = (data ?? []).map((m) => {
    const other = m.profile_a_id === profileId ? m.profile_b : m.profile_a;
    return { ...m, matched_profile: other };
  });

  return NextResponse.json({ success: true, data: mapped });
}

export async function POST(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { targetProfileId } = await request.json();
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

  if (mutual) {
    const { data: match } = await admin
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

    return NextResponse.json({ success: true, data: { like, match, mutual: true } });
  }

  return NextResponse.json({ success: true, data: { like, mutual: false } });
}
