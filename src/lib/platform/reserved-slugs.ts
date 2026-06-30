/** App route segments that must not be handled as SEO matrimony slugs */
export const PLATFORM_APP_SEGMENTS = new Set([
  "discover",
  "compatibility",
  "chats",
  "activity",
  "profile",
  "saathi",
]);

export function isPlatformAppSegment(slug: string): boolean {
  return PLATFORM_APP_SEGMENTS.has(slug);
}
