import type { MetadataRoute } from "next";
import { getPublishedSeoPagesForSitemap } from "@/lib/seo/service";
import { getPublishedSuccessStories } from "@/lib/success-stories/service";
import { getSiteUrl } from "@/lib/seo/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [seoPages, stories] = await Promise.all([
    getPublishedSeoPagesForSitemap(),
    getPublishedSuccessStories(),
  ]);

  const seoEntries: MetadataRoute.Sitemap = seoPages.map((page) => ({
    url: `${siteUrl}${page.route_path}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
    changeFrequency: page.route_path === "/" ? "daily" : "weekly",
    priority: page.route_path === "/" ? 1 : 0.8,
  }));

  const storyEntries: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${siteUrl}/success-stories/${story.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/welcome`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/success-stories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/share-your-story`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const seen = new Set<string>();
  return [...seoEntries, ...storyEntries, ...staticEntries].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
