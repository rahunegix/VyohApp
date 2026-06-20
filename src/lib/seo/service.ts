import { createAdminClient } from "@/lib/supabase/admin";
import {
  FALLBACK_HOME_SEO,
  FALLBACK_WELCOME_SEO,
} from "@/lib/seo/defaults";
import {
  programmaticRoutePath,
  type SeoPageRecord,
  type SeoPageView,
} from "@/lib/seo/types";

function normalizeRecord(row: SeoPageRecord): SeoPageView {
  return {
    ...row,
    sections: Array.isArray(row.sections) ? row.sections : [],
    faq: Array.isArray(row.faq) ? row.faq : [],
    focus_keywords: row.focus_keywords ?? [],
    related_links: Array.isArray(row.related_links) ? row.related_links : [],
  };
}

export async function getSeoPageByPath(routePath: string): Promise<SeoPageView | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("seo_pages")
      .select("*")
      .eq("route_path", routePath)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) {
      if (routePath === "/") return FALLBACK_HOME_SEO;
      if (routePath === "/welcome") {
        return { ...FALLBACK_HOME_SEO, ...FALLBACK_WELCOME_SEO, route_path: "/welcome" };
      }
      return null;
    }

    return normalizeRecord(data as SeoPageRecord);
  } catch {
    if (routePath === "/") return FALLBACK_HOME_SEO;
    return null;
  }
}

export async function getSeoPageBySlug(slug: string): Promise<SeoPageView | null> {
  return getSeoPageByPath(programmaticRoutePath(slug));
}

export async function getAllSeoPagesAdmin(): Promise<SeoPageRecord[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("seo_pages")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("route_path", { ascending: true });

  if (error || !data) return [];
  return (data as SeoPageRecord[]).map(normalizeRecord);
}

export async function getPublishedSeoPagesForSitemap(): Promise<
  Pick<SeoPageRecord, "route_path" | "updated_at">[]
> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("seo_pages")
      .select("route_path, updated_at")
      .eq("is_published", true)
      .eq("robots_index", true);

    if (error || !data?.length) {
      return [{ route_path: "/", updated_at: new Date().toISOString() }];
    }
    return data as Pick<SeoPageRecord, "route_path" | "updated_at">[];
  } catch {
    return [{ route_path: "/", updated_at: new Date().toISOString() }];
  }
}

export async function getPublicProfileAvailability(profileId: string): Promise<
  | { status: "available"; full_name: string; city: string | null; district: string | null; region: string | null }
  | { status: "banned" | "not_found" }
> {
  try {
    const admin = createAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .select("id, full_name, city, district, region, profile_status, user_id")
      .eq("id", profileId)
      .maybeSingle();

    if (error || !profile) return { status: "not_found" };

    const { data: user } = await admin
      .from("users")
      .select("is_active")
      .eq("id", profile.user_id)
      .maybeSingle();

    const banned =
      !user?.is_active ||
      profile.profile_status === "suspended" ||
      profile.profile_status === "hidden" ||
      profile.profile_status === "draft";

    if (banned) return { status: "banned" };

    if (profile.profile_status !== "active") return { status: "banned" };

    return {
      status: "available",
      full_name: profile.full_name ?? "Saathini member",
      city: profile.city,
      district: profile.district,
      region: profile.region,
    };
  } catch {
    return { status: "not_found" };
  }
}
