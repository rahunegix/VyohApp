import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthProfileId } from "@/lib/auth/api-auth";

export async function GET(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const conversationId = new URL(request.url).searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ success: false, error: "conversationId required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: conv } = await admin
    .from("conversations")
    .select("*, match:matches(*)")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv?.match) {
    return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
  }

  const match = conv.match as { profile_a_id: string; profile_b_id: string };
  if (match.profile_a_id !== profileId && match.profile_b_id !== profileId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { data: messages, error } = await admin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: messages ?? [] });
}

export async function POST(request: NextRequest) {
  const profileId = await getAuthProfileId(request);
  if (!profileId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, text } = await request.json();
  if (!conversationId || !text?.trim()) {
    return NextResponse.json(
      { success: false, error: "conversationId and text required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: conv } = await admin
    .from("conversations")
    .select("*, match:matches(*)")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv?.match) {
    return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
  }

  const match = conv.match as { profile_a_id: string; profile_b_id: string };
  if (match.profile_a_id !== profileId && match.profile_b_id !== profileId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_profile_id: profileId,
      message_text: text.trim(),
      message_type: "text",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  await admin
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return NextResponse.json({ success: true, data });
}
