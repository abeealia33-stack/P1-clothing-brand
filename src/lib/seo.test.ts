import { describe, expect, it } from "vitest";
import { absoluteUrl, indexableShopPaths, pageMetadata, productLabel, productMetadata, productSchema, serializeJsonLd, shopMetadata } from "./seo";
import { resolveCollections, type Category, type Product } from "./types";
import { site } from "./site";

const product: Product = {
  id: "piece-1", slug: "kurta", name: "kurta", urdu: null, collection: "rozana",
  price: 2999, sizes: ["S", "M"], colors: [{ name: "Clay", hex: "#c9a18f" }],
  stock: 3, photos: ["/uploads/kurta.jpg", "https://images.example.com/kurta.jpg"],
  description: "A pre-washed cotton kurta.", details: [], active: true, position: 0,
  categoryIds: ["cat-1"],
};
const collections = resolveCollections({ ghar: { inNav: false } });
const categories: Category[] = [
  { id: "cat-1", name: "Everyday", slug: "everyday", position: 0 },
  { id: "cat-2", name: "Empty", slug: "empty", position: 1 },
];

describe("SEO metadata", () => {
  it("identifies each public page rather than the home page", () => {
    const metadata = pageMetadata("Contact", "Get in touch", "/contact");
    expect(metadata.alternates?.canonical).toBe("/contact");
    expect(metadata.openGraph).toMatchObject({ url: "/contact", title: "Contact" });
    expect(absoluteUrl("/contact")).toBe(`${site.url.replace(/\/$/, "")}/contact`);
  });

  it("uses only existing catalogue facts in product titles and descriptions", () => {
    expect(productLabel(product)).toBe("kurta in Clay");
    expect(productLabel({ ...product, name: "Clay Kurta" })).toBe("Clay Kurta");
    expect(productMetadata(product).description).toContain("Sizes: S, M");
    expect(productMetadata({ ...product, stock: 0 }).description).toContain("sold out");
  });

  it("indexes a visible populated collection with its own canonical", () => {
    const metadata = shopMetadata({ collection: "rozana" }, collections, categories, [product]);
    expect(metadata.alternates?.canonical).toBe("/shop?collection=rozana");
    expect(metadata.robots).toBeUndefined();
  });

  it("consolidates sort URLs but keeps the useful collection identity", () => {
    const metadata = shopMetadata({ collection: "rozana", sort: "price-asc" }, collections, categories, [product]);
    expect(metadata.alternates?.canonical).toBe("/shop?collection=rozana");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it("does not index combined filters, unknown ranges, or empty collections", () => {
    for (const query of [{ collection: "rozana", category: "everyday" }, { collection: "missing" }, { collection: "ghar" }, { category: "empty" }, { price: "under-3000" }]) {
      const metadata = shopMetadata(query, collections, categories, [product]);
      expect(metadata.alternates?.canonical).toBe("/shop");
      expect(metadata.robots).toMatchObject({ index: false });
    }
    expect(indexableShopPaths(collections, categories, [product])).toEqual(["/shop?collection=rozana", "/shop?category=everyday"]);
  });
});

describe("product structured data", () => {
  it("uses live stock, whole rupees, stable identifiers and absolute image URLs", () => {
    const node = productSchema(product)["@graph"][0];
    expect(node).toMatchObject({ "@type": "Product", sku: "piece-1", name: "kurta in Clay", offers: { price: 2999, priceCurrency: "PKR", availability: "https://schema.org/InStock" } });
    expect(node.image).toEqual([absoluteUrl("/uploads/kurta.jpg"), "https://images.example.com/kurta.jpg"]);
    expect(node).not.toHaveProperty("aggregateRating");
    expect(node).not.toHaveProperty("gtin");
  });

  it("updates stock and shipping at the actual free-delivery threshold", () => {
    const node = productSchema({ ...product, stock: 0, price: site.freeShippingOver })["@graph"][0];
    expect(node.offers).toMatchObject({ availability: "https://schema.org/OutOfStock", shippingDetails: { shippingRate: { value: 0, currency: "PKR" } } });
    expect(productSchema({ ...product, price: site.freeShippingOver - 1 })["@graph"][0].offers?.shippingDetails.shippingRate.value).toBe(250);
  });

  it("prevents catalogue text from closing a JSON-LD script", () => {
    const malicious = { name: '</script><script>alert("x")</script>' };
    const json = serializeJsonLd(malicious);
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual(malicious);
  });
});
