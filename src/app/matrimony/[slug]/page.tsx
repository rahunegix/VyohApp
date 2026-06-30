import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPlatformAppSegment } from "@/lib/platform/reserved-slugs";
import { getSeoPageBySlug } from "@/lib/seo/service";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { SeoLandingContent } from "@/components/seo/seo-landing-content";
import { SeoJsonLdBundle } from "@/components/seo/json-ld-script";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (isPlatformAppSegment(slug)) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }
  const page = await getSeoPageBySlug(slug);
  if (!page) return { title: "Not Found", robots: { index: false, follow: false } };
  return buildSeoMetadata(page);
}

export default async function ProgrammaticMatrimonyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (isPlatformAppSegment(slug)) notFound();
  const page = await getSeoPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <SeoJsonLdBundle page={page} />
      <div className="min-h-dvh bg-gradient-to-b from-primary/5 via-background to-background">
        <SeoLandingContent page={page} />
      </div>
    </>
  );
}
