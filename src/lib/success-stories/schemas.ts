import { z } from "zod";

export const successStoryPayloadSchema = z.object({
  slug: z.string().min(2).optional(),
  story_type: z.enum(["relationship", "marriage"]),
  names: z.string().min(2),
  location: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  quote: z.string().min(10),
  body: z.string().optional().nullable(),
  cover_image_url: z.string().url(),
  alt_text: z.string().optional().nullable(),
  is_featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  sort_order: z.number().int().optional(),
});

export const storySubmissionSchema = z.object({
  story_type: z.enum(["relationship", "marriage"]),
  submitter_name: z.string().min(2),
  partner_name: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  story: z.string().min(30),
  consent: z.boolean().refine((value) => value === true, {
    message: "Consent is required to share your story",
  }),
});
