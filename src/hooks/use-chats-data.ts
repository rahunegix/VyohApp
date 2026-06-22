"use client";

import { useEffect, useState } from "react";
import type { ChatRequest, Conversation, DiscoverProfile } from "@/types";

function mapProfileRow(row: Record<string, unknown>): DiscoverProfile {
  return {
    id: String(row.id),
    full_name: String(row.full_name ?? "Member"),
    age: Number(row.age ?? 25),
    city: String(row.city ?? ""),
    district: String(row.district ?? ""),
    region: row.region as DiscoverProfile["region"],
    education: String(row.education ?? ""),
    profession: String(row.profession ?? ""),
    bio: String(row.bio ?? ""),
    intent: row.intent as DiscoverProfile["intent"],
    trust_score: Number(row.trust_score ?? 50),
    photos: ((row.profile_photos ?? row.photos ?? []) as Record<string, unknown>[]).map(
      (p, i) => ({
        id: String(p.id ?? i),
        url: String(p.url ?? ""),
        sort_order: Number(p.sort_order ?? i),
        is_primary: Boolean(p.is_primary ?? i === 0),
        is_private: Boolean(p.is_private ?? false),
      })
    ),
    personality_tags: (row.personality_tags as string[]) ?? [],
    interest_tags: (row.interest_tags as string[]) ?? [],
    values_tags: (row.values_tags as string[]) ?? [],
    lifestyle: (row.lifestyle as Record<string, string>) ?? {},
    family_background: (row.family_background as Record<string, string>) ?? {},
    verification: {
      mobile_verified: true,
      face_verified: false,
      id_verified: false,
    },
  };
}

export function useChatsData() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<(ChatRequest & { sender: DiscoverProfile })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chats");
      const json = await res.json();
      if (!json.success || !json.data) {
        setConversations([]);
        setRequests([]);
        return;
      }

      const rows = json.data.conversations as Record<string, unknown>[];
      setConversations(
        rows
          .filter((row) => row.conversation_id)
          .map((row) => {
            const profile = mapProfileRow(row.profile as Record<string, unknown>);
            return {
              id: String(row.conversation_id),
              match_id: String(row.match_id ?? ""),
              created_at: String(row.matched_at ?? new Date().toISOString()),
              updated_at: String(row.matched_at ?? new Date().toISOString()),
              other_profile: profile,
              last_message: undefined,
              unread_count: 0,
            } satisfies Conversation;
          })
      );

      const reqRows = (json.data.requests ?? []) as Record<string, unknown>[];
      setRequests(
        reqRows
          .map((row) => {
            const sender = row.sender as Record<string, unknown> | undefined;
            if (!sender?.id) return null;
            return {
              id: String(row.id),
              sender_profile_id: String(row.sender_profile_id),
              receiver_profile_id: String(row.receiver_profile_id),
              message: String(row.message ?? ""),
              status: row.status as ChatRequest["status"],
              created_at: String(row.created_at ?? new Date().toISOString()),
              updated_at: String(row.updated_at ?? new Date().toISOString()),
              sender: mapProfileRow(sender),
            };
          })
          .filter(Boolean) as (ChatRequest & { sender: DiscoverProfile })[]
      );
    } catch {
      setConversations([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const respondToRequest = async (requestId: string, action: "accept" | "decline") => {
    const res = await fetch("/api/chats", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    const json = await res.json();
    if (json.success) await load();
    return json;
  };

  return { conversations, requests, loading, respondToRequest, reload: load };
}
