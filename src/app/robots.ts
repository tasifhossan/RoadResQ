import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/how-it-works",
          "/about",
          "/faq",
          "/contact",
          "/login",
          "/register",
        ],
        disallow: [
          "/customer/",
          "/mechanic/",
          "/admin/",
          "/api/",
          "/payment/",
          "/design-preview/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
