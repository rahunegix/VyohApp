import type { PostgrestError } from "@supabase/supabase-js";

export const SUCCESS_STORY_GALLERY_MIGRATION = `
ALTER TABLE success_stories
  ADD COLUMN IF NOT EXISTS gallery_image_urls TEXT[] NOT NULL DEFAULT '{}';
`.trim();

export function isMissingGalleryColumnError(error: PostgrestError | null): boolean {
  if (!error?.message) return false;
  return error.message.includes("gallery_image_urls");
}

export function galleryMigrationHint(): string {
  return `Run this in Supabase SQL Editor:\n${SUCCESS_STORY_GALLERY_MIGRATION}`;
}

export function omitGalleryField<T extends Record<string, unknown>>(payload: T): Omit<T, "gallery_image_urls"> {
  const rest = { ...payload };
  delete rest.gallery_image_urls;
  return rest as Omit<T, "gallery_image_urls">;
}
