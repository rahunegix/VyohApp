import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthProfileId, getAuthUser } from "@/lib/auth/api-auth";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  const profileId = await getAuthProfileId(request);
  if (!auth?.user?.id || !profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: matches } = await admin
    .from("matches")
    .select(`
      *,
      profile_a:profiles!matches_profile_a_id_fkey(*, profile_photos(*)),
      profile_b:profiles!matches_profile_b_id_fkey(*, profile_photos(*)),
      conversations(*)
    `)
    .or(`profile_a_id.eq.${profileId},profile_b_id.eq.${profileId}`)
    .eq("match_status", "active");

  const conversations = (matches ?? []).map((m) => {
    const other = m.profile_a_id === profileId ? m.profile_b : m.profile_a;
    const conv = Array.isArray(m.conversations) ? m.conversations[0] : m.conversations;
    return {
      match_id: m.id,
      conversation_id: conv?.id ?? null,
      profile: other,
      matched_at: m.matched_at,
    };
  });

  const conversationIds = conversations
    .map((c) => c.conversation_id)
    .filter((id): id is string => Boolean(id));

  const lastMessageByConv: Record<
    string,
    { message_text: string; created_at: string; sender_profile_id: string }
  > = {};

  if (conversationIds.length) {
    const { data: messages } = await admin
      .from("messages")
      .select("conversation_id, message_text, created_at, sender_profile_id")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    for (const msg of messages ?? []) {
      const convId = String(msg.conversation_id);
      if (!lastMessageByConv[convId]) {
        lastMessageByConv[convId] = {
          message_text: String(msg.message_text ?? ""),
          created_at: String(msg.created_at ?? ""),
          sender_profile_id: String(msg.sender_profile_id ?? ""),
        };
      }
    }
  }

  const conversationsWithPreview = conversations.map((c) => ({
    ...c,
    last_message: c.conversation_id ? lastMessageByConv[c.conversation_id] ?? null : null,
  }));

  const { data: requests } = await admin
    .from("chat_requests")
    .select("*, sender:profiles!chat_requests_sender_profile_id_fkey(*, profile_photos(*))")
    .eq("receiver_profile_id", profileId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return NextResponse.json({
    success: true,
    data: { conversations: conversationsWithPreview, requests: requests ?? [] },
  });
}

export async function POST(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { receiverProfileId, message } = await request.json();
  if (!receiverProfileId || !message?.trim()) {
    return NextResponse.json(
      { success: false, error: "receiverProfileId and message required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("chat_requests")
    .insert({
      sender_profile_id: profileId,
      receiver_profile_id: receiverProfileId,
      message: message.trim(),
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, action } = await request.json();
  if (!requestId || !["accept", "decline"].includes(action)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("chat_requests")
    .update({ status: action === "accept" ? "accepted" : "declined" })
    .eq("id", requestId)
    .eq("receiver_profile_id", profileId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
