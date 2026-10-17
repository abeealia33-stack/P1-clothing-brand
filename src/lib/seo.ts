import type { Metadata } from "next";
import { facebookLink, instagramLink, linkedinLink, site } from "./site";
import { priceLabel } from "./format";
import { shippingFor } from "./shipping";
import type { Category, Product, ResolvedCollection } from "./types";

export const absoluteUrl = (path: string) => new URL(path, `${site.url.replace(/\/$/, "")}/`).href;
export const collectionPath = (slug: string) => `/shop?${new URLSearchParams({ collection: slug })}`;
export const categoryPath = (slug: string) => `/shop?${new URLSearchParams({ category: slug })}`;
export const noIndex: Metadata["robots"] = { index: false, follow: true };

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website", siteName: site.name, locale: "en_PK",
      title, description, url: path,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Describe the actual colour without guessing a fabric or renaming the catalogue. */
export function productLabel(product: Pick<Product, "name" | "colors">) {
  const color = product.colors.length === 1 ? product.colors[0].name.trim() : "";
  return color && !product.name.toLowerCase().includes(color.toLowerCase())
    ? `${product.name} in ${color}`
    : product.name;
}

export function productMetadata(product: Product): Metadata {
  const label = productLabel(product);
  const description = `${product.description.trim() || label} ${priceLabel(product.price)}. ${product.stock > 0 ? "In stock" : "Currently sold out"}.${product.sizes.length ? ` Sizes: ${product.sizes.join(", ")}.` : ""} Cash on delivery across Pakistan.`;
  return pageMetadata(`${label} | Pakistan`, description, `/product/${product.slug}`);
}

export type ShopSearch = { collection?: string; category?: string; price?: string; sort?: string };

export function indexableShopPaths(collections: ResolvedCollection[], categories: Category[], products: Product[]) {
  return [
    ...collections.filter((c) => c.inNav && products.some((p) => p.collection === c.slug)).map((c) => collectionPath(c.slug)),
    ...categories.filter((c) => products.some((p) => p.categoryIds.includes(c.id))).map((c) => categoryPath(c.slug)),
  ];
}

export function shopMetadata(query: ShopSearch, collections: ResolvedCollection[], categories: Category[], products: Product[]): Metadata {
  const collection = collections.find((c) => c.slug === query.collection);
  const category = categories.find((c) => c.slug === query.category);
  const singleFilter = Boolean(query.collection) !== Boolean(query.category);
  const requestedPath = singleFilter
    ? query.collection ? collectionPath(query.collection) : categoryPath(query.category!)
    : "/shop";
  const validFilter = indexableShopPaths(collections, categories, products).includes(requestedPath);
  const filtered = Boolean(query.collection || query.category);
  const path = validFilter ? requestedPath : "/shop";
  const name = validFilter ? collection?.name ?? category?.name : undefined;
  const metadata = pageMetadata(
    name ? `${name} Clothing | Pakistan` : "Shop Clothing Online in Pakistan",
    name
      ? `Shop the ${name} range from Bilques. Cash on delivery across Pakistan, with sizes, colours and current prices on each product page.`
      : "Explore clothing from Bilques. See current prices, sizes and colours, with cash on delivery across Pakistan and free shipping from PKR 3,000.",
    path,
  );
  if ((filtered && !validFilter) || query.price !== undefined || query.sort !== undefined) metadata.robots = noIndex;
  return metadata;
}

// Admin-edited strings must not be able to close the JSON-LD script element.
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": absoluteUrl("/#organization"),
    name: site.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon1.png"),
    email: site.email,
    telephone: `+${site.whatsapp}`,
    sameAs: [instagramLink, facebookLink, linkedinLink],
  };
}

export function productSchema(product: Product) {
  const url = absoluteUrl(`/product/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: productLabel(product),
        description: product.description,
        url,
        sku: product.id,
        image: product.photos.map(absoluteUrl),
        brand: { "@type": "Brand", name: site.name },
        ...(product.colors.length ? { color: product.colors.map((c) => c.name).join(", ") } : {}),
        ...(product.sizes.length ? { size: product.sizes } : {}),
        offers: {
          "@type": "Offer",
          url,
          price: product.price,
          priceCurrency: "PKR",
          availability: `https://schema.org/${product.stock > 0 ? "InStock" : "OutOfStock"}`,
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": absoluteUrl("/#organization") },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
            shippingRate: { "@type": "MonetaryAmount", value: shippingFor(product.price), currency: "PKR" },
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("/shop") },
          { "@type": "ListItem", position: 3, name: productLabel(product), item: url },
        ],
      },
    ],
  };
}
