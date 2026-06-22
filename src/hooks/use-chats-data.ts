"use client";

import { useEffect, useState } from "react";
import type { ChatRequest, Conversation, DiscoverProfile } from "@/types";
import { mapDiscoverProfile } from "@/lib/profiles/map-api-profile";

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
            const profile = mapDiscoverProfile(row.profile as Record<string, unknown>);
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
              sender: mapDiscoverProfile(sender),
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
