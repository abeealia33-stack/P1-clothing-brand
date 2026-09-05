import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/catalogue";
import { listCategories } from "@/lib/categories";
import { collections } from "@/lib/types";
import { site } from "@/lib/site";

/* Rebuilt hourly rather than at build time, so a piece added in the admin is
   listed without a redeploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const url = (path: string) => `${site.url}${path}`;

  /* The cart, checkout and account pages are deliberately absent: they are
     per-visitor and have nothing to index. */
  const pages: MetadataRoute.Sitemap = [
    { url: url("/"), priority: 1, changeFrequency: "weekly" },
    { url: url("/shop"), priority: 0.9, changeFrequency: "daily" },
    { url: url("/about"), priority: 0.5 },
    { url: url("/contact"), priority: 0.5 },
    { url: url("/shipping"), priority: 0.5 },
    { url: url("/track"), priority: 0.3 },
  ];

  for (const c of collections) {
    pages.push({
      url: url(`/shop?collection=${c.slug}`),
      priority: 0.7,
      changeFrequency: "weekly",
    });
  }

  for (const c of categories) {
    pages.push({ url: url(`/shop?category=${c.slug}`), priority: 0.6 });
  }

  for (const product of products) {
    pages.push({
      url: url(`/product/${product.slug}`),
      priority: 0.8,
      changeFrequency: "weekly",
    });
  }

  return pages;
}
