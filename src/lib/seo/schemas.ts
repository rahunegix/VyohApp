import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
});

const sectionSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  bullets: z.array(z.string()).optional(),
});

const relatedLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const seoPagePayloadSchema = z.object({
  route_path: z.string().min(1),
  page_kind: z.enum(["static", "programmatic"]).optional(),
  slug: z.string().optional().nullable(),
  title: z.string().min(3),
  meta_description: z.string().min(10),
  meta_keywords: z.string().optional().nullable(),
  og_title: z.string().optional().nullable(),
  og_description: z.string().optional().nullable(),
  og_image_url: z.string().url().optional().or(z.literal("")).nullable(),
  canonical_path: z.string().optional().nullable(),
  robots_index: z.boolean().optional(),
  robots_follow: z.boolean().optional(),
  h1: z.string().optional().nullable(),
  hero_subtitle: z.string().optional().nullable(),
  intro_html: z.string().optional().nullable(),
  sections: z.array(sectionSchema).optional(),
  faq: z.array(faqSchema).optional(),
  focus_keywords: z.array(z.string()).optional(),
  related_links: z.array(relatedLinkSchema).optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});
