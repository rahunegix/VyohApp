import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  FALLBACK_SUCCESS_STORIES,
  recordToView,
  type SuccessStoryRecord,
  type SuccessStoryView,
} from "@/lib/success-stories/types";

function logStoryFetchError(context: string, error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[success-stories] ${context}`, error);
  }
}

export async function getPublishedSuccessStories(): Promise<SuccessStoryView[]> {
  noStore();
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("success_stories")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      logStoryFetchError("getPublishedSuccessStories", error);
      return FALLBACK_SUCCESS_STORIES;
    }
    if (!data?.length) return [];
    return (data as SuccessStoryRecord[]).map(recordToView);
  } catch (err) {
    logStoryFetchError("getPublishedSuccessStories", err);
    return FALLBACK_SUCCESS_STORIES;
  }
}

export async function getLatestSuccessStories(limit = 3): Promise<SuccessStoryView[]> {
  noStore();
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("success_stories")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logStoryFetchError("getLatestSuccessStories", error);
      return [];
    }
    if (!data?.length) return [];
    return (data as SuccessStoryRecord[]).map(recordToView);
  } catch (err) {
    logStoryFetchError("getLatestSuccessStories", err);
    return [];
  }
}

export async function getFeaturedSuccessStories(): Promise<SuccessStoryView[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("success_stories")
      .select("*")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(6);

    if (error || !data?.length) return FALLBACK_SUCCESS_STORIES;
    return (data as SuccessStoryRecord[]).map(recordToView);
  } catch {
    return FALLBACK_SUCCESS_STORIES;
  }
}

export async function getSuccessStoryBySlug(slug: string): Promise<SuccessStoryView | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("success_stories")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_SUCCESS_STORIES.find((s) => s.slug === slug) ?? null;
    }
    return recordToView(data as SuccessStoryRecord);
  } catch {
    return FALLBACK_SUCCESS_STORIES.find((s) => s.slug === slug) ?? null;
  }
}
