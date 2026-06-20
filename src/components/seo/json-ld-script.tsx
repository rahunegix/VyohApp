import {
  breadcrumbJsonLd,
  faqJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/json-ld";
import type { SeoPageView } from "@/lib/seo/types";

function JsonLdScript({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data.length === 1 ? data[0] : data) }}
    />
  );
}

export function SeoJsonLdBundle({ page }: { page: SeoPageView }) {
  const schemas: Record<string, unknown>[] = [organizationJsonLd(), websiteJsonLd()];

  const faq = faqJsonLd(page.faq);
  if (faq) schemas.push(faq);

  if (page.page_kind === "programmatic" && page.slug) {
    schemas.push(
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Matrimony", path: "/matrimony/uttarakhand-matrimony" },
        { name: page.h1 || page.title, path: page.route_path },
      ])
    );
  }

  return <JsonLdScript data={schemas} />;
}
