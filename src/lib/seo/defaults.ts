import type { SeoPageView } from "@/lib/seo/types";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const FALLBACK_HOME_SEO: SeoPageView = {
  id: "fallback-home",
  route_path: "/",
  page_kind: "static",
  slug: null,
  title: `${APP_NAME} — Uttarakhand Matrimony & Dating | Garhwali & Kumaoni Matches`,
  meta_description:
    "Saathini is Uttarakhand's verified matrimony and dating platform for Garhwali & Kumaoni singles. A trusted alternative to Maangal Platform and Shaadi.com.",
  meta_keywords:
    "uttarakhand matrimony, garhwali matrimony, kumaoni matrimony, alternative to Maangal Platform, alternative to shadi.com",
  og_title: null,
  og_description: null,
  og_image_url: null,
  canonical_path: "/",
  robots_index: true,
  robots_follow: true,
  h1: "Uttarakhand's trusted matrimony & dating platform",
  hero_subtitle: "Garhwali · Kumaoni · Verified profiles · Hindu marriage & serious relationships",
  intro_html:
    "<p>Saathini connects Uttarakhand singles and families with intent-first matching — from modern dating to traditional Hindu marriage.</p>",
  sections: [
    {
      title: "Why Saathini for Uttarakhand matrimony",
      body: "Unlike generic national portals, Saathini is designed for Pahadi culture — gotra preferences, family involvement, and region-aware discovery.",
      bullets: [
        "Garhwali & Kumaoni community focus",
        "Phone + face verified profiles",
        "Marriage and relationship paths on one platform",
      ],
    },
    {
      title: "A modern alternative to Pahadi Maangal Platform & Shaadi Matrimony",
      body: "Many Uttarakhand families search for local alternatives to Pahadi Maangal Platform, Shaadi.com, and BharatMatrimony.",
      bullets: [
        "Local Uttarakhand discovery filters",
        "Consent-first chat before family intro",
        "Success stories from real Uttarakhand couples",
      ],
    },
  ],
  faq: [
    {
      question: "Is Saathini only for marriage?",
      answer:
        "No. You can choose serious relationship or Hindu marriage intent on the same platform.",
    },
    {
      question: "How is Saathini different from Maangal Platform or Shaadi.com?",
      answer:
        "Saathini focuses on Uttarakhand — Garhwali and Kumaoni communities with verified profiles.",
    },
    {
      question: "Which cities does Saathini cover?",
      answer: "All 13 districts of Uttarakhand including Dehradun, Haridwar, and Nainital.",
    },
  ],
  focus_keywords: [
    "uttarakhand matrimony",
    "garhwali matrimony",
    "alternative to Maangal Platform",
    "alternative to shadi.com",
  ],
  related_links: [
    { label: "Garhwali matrimony", href: "/matrimony/garhwali-matrimony" },
    { label: "Alternative to Maangal Platform", href: "/matrimony/alternative-maangal-com" },
    { label: "Success stories", href: "/success-stories" },
  ],
  is_published: true,
  sort_order: 0,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export const FALLBACK_WELCOME_SEO: Partial<SeoPageView> = {
  title: `Welcome to ${APP_NAME} — ${APP_TAGLINE}`,
  meta_description: `Join ${APP_NAME} — verified Uttarakhand matrimony and dating.`,
  h1: `Welcome to ${APP_NAME}`,
};
