import type { Metadata } from "next";
import { getSeoPageByPath } from "@/lib/seo/service";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { FALLBACK_HOME_SEO } from "@/lib/seo/defaults";
import { getLatestSuccessStories } from "@/lib/success-stories/service";
import { SeoLandingContent } from "@/components/seo/seo-landing-content";
import { SeoJsonLdBundle } from "@/components/seo/json-ld-script";
import { SiteFooter } from "@/components/common/site-footer";

export const dynamic = "force-dynamic";

const HOME_STORY_LIMIT = 3;

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getSeoPageByPath("/")) ?? FALLBACK_HOME_SEO;
  return buildSeoMetadata(page);
}

export default async function HomePage() {
  const [page, latestStories] = await Promise.all([
    getSeoPageByPath("/"),
    getLatestSuccessStories(HOME_STORY_LIMIT),
  ]);
  const seoPage = page ?? FALLBACK_HOME_SEO;

  return (
    <>
      <SeoJsonLdBundle page={seoPage} />
      <div className="min-h-dvh bg-gradient-to-b from-primary/5 via-background to-background">
        <SeoLandingContent page={seoPage} latestStories={latestStories} />
        <SiteFooter />
      </div>
    </>
  );
}
