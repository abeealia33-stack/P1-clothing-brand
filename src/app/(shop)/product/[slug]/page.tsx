import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, relatedProducts } from "@/lib/catalogue";
import { getSettings } from "@/lib/settings";
import { resolveCollection } from "@/lib/types";
import { priceLabel, rupees } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppGlyph } from "@/components/WhatsAppButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Piece not found" };

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    // The image itself comes from opengraph-image.tsx alongside this file.
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      url: `/product/${product.slug}`,
    },
    twitter: { card: "summary_large_image", title: product.name },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  /* Shown whether or not the collection is in the menus: what a piece belongs
     to is a fact about the piece, not a way of getting around the shop. */
  const [{ collections: collectionEdits }, alsoIn] = await Promise.all([
    getSettings(),
    relatedProducts(product.collection, product.slug, 4),
  ]);
  const collection = resolveCollection(product.collection, collectionEdits)!;
  const shipsFree = product.price >= site.freeShippingOver;

  return (
    <div className="pb-28 md:pb-0">
      <div className="mx-auto max-w-6xl md:grid md:grid-cols-2 md:gap-12 md:px-5 md:py-12">
        <div className="md:sticky md:top-24 md:self-start">
          <Gallery
            photos={product.photos}
            alt={`${product.name} in ${product.colors[0].name}`}
          />
        </div>

        <div className="px-5 pt-6 md:px-0 md:pt-0">
          <Link
            href={`/shop?collection=${collection.slug}`}
            className="text-sm"
            style={{ color: "var(--color-sage-deep)" }}
          >
            {collection.name}
          </Link>
          <h1 className="mt-1 text-4xl md:text-5xl">{product.name}</h1>
          {product.urdu && (
            <p className="urdu mt-1 text-2xl" style={{ color: "var(--color-sage-deep)" }}>
              {product.urdu}
            </p>
          )}
          <p className="tnum mt-3 text-lg">{priceLabel(product.price)}</p>

          <p className="measure mt-5">{product.description}</p>

          <ProductBuy product={product} />

          {/* Adding to a cart is not how everyone here shops. Plenty would
              rather ask about the fabric or the fit first, and the message
              arrives already naming the piece. */}
          <a
            href={whatsappLink(
              `Salam! I'm interested in the ${product.name} (${priceLabel(product.price)}). Could you tell me more?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm underline underline-offset-4"
            style={{ color: "var(--color-sage-deep)" }}
          >
            <WhatsAppGlyph size={16} />
            Ask about this piece on WhatsApp
          </a>

          <div className="rule mt-9 pt-6">
            <h2 className="text-2xl">The details</h2>
            <ul className="measure mt-3 space-y-2 text-sm">
              {product.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-px w-3 shrink-0"
                    style={{ background: "var(--color-sage)" }}
                  />
                  <span style={{ color: "var(--color-ink-soft)" }}>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rule mt-8 pt-6 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            <p className="tnum">
              {shipsFree
                ? "Ships free — this piece is over the free shipping threshold."
                : `PKR 250 shipping, or free once your cart passes PKR ${rupees(site.freeShippingOver)}.`}
            </p>
            <p className="mt-1.5">
              {site.shipping.majorCities} in major cities,{" "}
              {site.shipping.elsewhere} elsewhere. Pay cash when it arrives.
            </p>
          </div>
        </div>
      </div>

      {alsoIn.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 className="text-3xl md:text-4xl">The rest of {collection.name}</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {alsoIn.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
