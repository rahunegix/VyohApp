export type SeoPageKind = "static" | "programmatic";

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoSection {
  title: string;
  body: string;
  bullets?: string[];
}

export interface SeoRelatedLink {
  label: string;
  href: string;
}

export interface SeoPageRecord {
  id: string;
  route_path: string;
  page_kind: SeoPageKind;
  slug: string | null;
  title: string;
  meta_description: string;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_path: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  h1: string | null;
  hero_subtitle: string | null;
  intro_html: string | null;
  sections: SeoSection[];
  faq: SeoFaqItem[];
  focus_keywords: string[];
  related_links: SeoRelatedLink[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SeoPageView = SeoPageRecord;

export interface PublicProfileSeoMeta {
  id: string;
  full_name: string | null;
  city: string | null;
  district: string | null;
  region: string | null;
  profile_status: string;
  user_active: boolean;
}

export function slugifySeoPath(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function programmaticRoutePath(slug: string): string {
  return `/matrimony/${slug}`;
}
