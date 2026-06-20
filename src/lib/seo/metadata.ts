import type { Metadata } from "next";
import type { SeoPageView } from "@/lib/seo/types";
import { SEO_DEFAULTS, getSiteUrl } from "@/lib/seo/config";

export function buildSeoMetadata(page: SeoPageView, overrides?: Partial<Metadata>): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalPath = page.canonical_path || page.route_path;
  const canonical = `${siteUrl}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
  const title = page.title;
  const description = page.meta_description;
  const ogTitle = page.og_title || title;
  const ogDescription = page.og_description || description;
  const ogImage = page.og_image_url || SEO_DEFAULTS.defaultOgImage;
  const keywords = page.meta_keywords
    ? page.meta_keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : page.focus_keywords;

  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical },
    robots: {
      index: page.robots_index,
      follow: page.robots_follow,
      googleBot: { index: page.robots_index, follow: page.robots_follow },
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonical,
      siteName: SEO_DEFAULTS.siteName,
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    ...overrides,
  };
}

export function buildProfileMetadata(profile: {
  full_name: string;
  city: string | null;
  district: string | null;
  region: string | null;
  id: string;
}): Metadata {
  const location = [profile.city, profile.district, profile.region].filter(Boolean).join(", ");
  const title = `${profile.full_name}${location ? ` — ${location}` : ""} | Saathini Profile`;
  const description = `View ${profile.full_name}'s verified Saathini profile${location ? ` from ${location}` : ""}. Uttarakhand matrimony and dating on Saathini.`;

  return buildSeoMetadata({
    id: profile.id,
    route_path: `/p/${profile.id}`,
    page_kind: "static",
    slug: null,
    title,
    meta_description: description,
    meta_keywords: "uttarakhand matrimony profile, saathini profile",
    og_title: title,
    og_description: description,
    og_image_url: null,
    canonical_path: `/p/${profile.id}`,
    robots_index: true,
    robots_follow: true,
    h1: profile.full_name,
    hero_subtitle: location || "Saathini member",
    intro_html: null,
    sections: [],
    faq: [],
    focus_keywords: [],
    related_links: [],
    is_published: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}
