import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* The back office, the per-visitor pages, and the confirmation page —
         which carries a customer's name, phone and address. */
      disallow: ["/admin", "/api/", "/cart", "/checkout", "/account"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
