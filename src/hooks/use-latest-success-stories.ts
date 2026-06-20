"use client";

import { useEffect, useState } from "react";
import type { SuccessStoryView } from "@/lib/success-stories/types";

export function useLatestSuccessStories(limit = 3) {
  const [stories, setStories] = useState<SuccessStoryView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/success-stories/latest?limit=${limit}`, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setStories(json.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { stories, loading };
}
