import type { SeoFaqItem } from "@/lib/seo/types";
import { SEO_DEFAULTS, getSiteUrl } from "@/lib/seo/config";

export function organizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_DEFAULTS.siteName,
    url: siteUrl,
    logo: SEO_DEFAULTS.defaultOgImage,
    description: SEO_DEFAULTS.tagline,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Uttarakhand, India",
    },
  };
}

export function websiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_DEFAULTS.siteName,
    url: siteUrl,
    description: SEO_DEFAULTS.tagline,
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/matrimony/uttarakhand-matrimony`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd(faq: SeoFaqItem[]) {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
