import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/welcome", "/matrimony/", "/success-stories", "/p/"],
        disallow: [
          "/admin",
          "/api/",
          "/discover",
          "/profile",
          "/chats",
          "/onboarding",
          "/login",
          "/otp",
          "/settings",
          "/matches",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
