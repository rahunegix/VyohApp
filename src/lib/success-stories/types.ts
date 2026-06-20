export type SuccessStoryType = "relationship" | "marriage";

export type SuccessStoryStatus = "draft" | "published" | "archived";

export type StorySubmissionStatus = "pending" | "approved" | "rejected";

export interface SuccessStoryRecord {
  id: string;
  slug: string;
  story_type: SuccessStoryType;
  names: string;
  location: string | null;
  timeline: string | null;
  quote: string;
  body: string | null;
  cover_image_url: string;
  alt_text: string | null;
  is_featured: boolean;
  status: SuccessStoryStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StorySubmissionRecord {
  id: string;
  user_id: string | null;
  story_type: SuccessStoryType;
  submitter_name: string;
  partner_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  timeline: string | null;
  title: string | null;
  story: string;
  photo_urls: string[];
  consent: boolean;
  status: StorySubmissionStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const SUCCESS_STORY_TYPE_LABELS: Record<SuccessStoryType, string> = {
  relationship: "Relationship story",
  marriage: "Marriage story",
};

export const SUCCESS_STORY_TYPE_SHORT: Record<SuccessStoryType, string> = {
  relationship: "Relationship",
  marriage: "Marriage",
};

export function slugifyStory(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** UI-friendly story shape used across showcase + pages */
export interface SuccessStoryView {
  id?: string;
  slug: string;
  type: SuccessStoryType;
  typeLabel: string;
  names: string;
  location: string;
  timeline: string;
  quote: string;
  body: string;
  src: string;
  alt: string;
  label: string;
}

export const FALLBACK_SUCCESS_STORIES: SuccessStoryView[] = [
  {
    slug: "ankit-priya-marriage",
    type: "marriage",
    typeLabel: "Marriage story",
    names: "Ankit & Priya",
    location: "Dehradun · Garhwal",
    timeline: "Engaged in 4 months",
    quote:
      "Our families met through Saathini after we matched on values and gotra preferences. The mandap felt like it was always meant to be.",
    body:
      "Ankit from Dehradun and Priya from a Garhwali family connected on Saathini through shared values and family preferences. After thoughtful conversations and family introductions, they were engaged within four months.",
    src: "https://images.unsplash.com/photo-1583934270204-75a0e3b05ec5?auto=format&fit=crop&w=900&q=80",
    alt: "Hindu wedding ceremony with sacred fire and rituals",
    label: "Ankit & Priya — Marriage",
  },
  {
    slug: "rohit-kavya-relationship",
    type: "relationship",
    typeLabel: "Relationship story",
    names: "Rohit & Kavya",
    location: "Nainital · Kumaon",
    timeline: "Together 18 months",
    quote:
      "We chose the serious relationship path first. Saathini helped us build trust before our families got involved — no rush, just clarity.",
    body:
      "Rohit and Kavya matched in Nainital while both were looking for a serious, long-term relationship. They spent months building trust through consent-first chats before involving their families.",
    src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80",
    alt: "Indian wedding couple in traditional attire",
    label: "Rohit & Kavya — Relationship",
  },
  {
    slug: "aditya-ishita-relationship",
    type: "relationship",
    typeLabel: "Relationship story",
    names: "Aditya & Ishita",
    location: "Haridwar · Uttarakhand",
    timeline: "First date in 2 weeks",
    quote:
      "Verified profiles and consent-first chats made us comfortable exploring a connection. We are taking it one meaningful step at a time.",
    body:
      "Aditya and Ishita began with a verified match in Haridwar. Face verification and clear intent labels helped them feel safe exploring a new connection.",
    src: "https://images.unsplash.com/photo-1522673607200-8d87521a1536?auto=format&fit=crop&w=900&q=80",
    alt: "Indian couple celebrating together",
    label: "Aditya & Ishita — Relationship",
  },
];

export function recordToView(row: SuccessStoryRecord): SuccessStoryView {
  return {
    id: row.id,
    slug: row.slug,
    type: row.story_type,
    typeLabel: SUCCESS_STORY_TYPE_LABELS[row.story_type],
    names: row.names,
    location: row.location ?? "",
    timeline: row.timeline ?? "",
    quote: row.quote,
    body: row.body ?? row.quote,
    src: row.cover_image_url,
    alt: row.alt_text ?? row.names,
    label: `${row.names} — ${SUCCESS_STORY_TYPE_SHORT[row.story_type]}`,
  };
}
