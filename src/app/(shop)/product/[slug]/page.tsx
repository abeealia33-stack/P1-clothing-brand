import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, relatedProducts } from "@/lib/catalogue";
import { getSettings } from "@/lib/settings";
import { resolveCollection } from "@/lib/types";
import { photoAlt, priceLabel, rupees } from "@/lib/format";
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

/** A folded panel. <details> so it works before the JavaScript arrives. */
function Fold({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="fold-panel" open={open}>
      <summary>
        {title}
        <span aria-hidden="true" className="fold-sign" />
      </summary>
      <div className="fold-panel-body">{children}</div>
    </details>
  );
}

const mark = {
  width: 17,
  height: 17,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const Van = () => (
  <svg {...mark}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17.5" cy="18" r="1.6" />
  </svg>
);

const Wallet = () => (
  <svg {...mark}>
    <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H18v3M3 7.5V17a1 1 0 0 0 1 1h16v-4M3 7.5V10h18" />
    <circle cx="17" cy="12" r="1" />
  </svg>
);

const Swap = () => (
  <svg {...mark}>
    <path d="M4 9h13l-3-3M20 15H7l3 3" />
  </svg>
);

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
      <div className="mx-auto max-w-7xl md:grid md:grid-cols-2 md:gap-12 md:px-16 md:py-12">
        <div className="md:sticky md:top-24 md:self-start">
          <Gallery
            photos={product.photos}
            alt={photoAlt(product)}
          />
        </div>

        <div className="px-5 pt-6 md:px-0 md:pt-0">
          <p className="field-label" style={{ color: "var(--color-sage-deep)" }}>
            {collection.name}
          </p>
          <h1 className="mt-2 text-[2.25rem] md:text-[3.5rem]">{product.name}</h1>
          {product.urdu && (
            <p className="urdu mt-1 text-2xl" style={{ color: "var(--color-sage-deep)" }}>
              {product.urdu}
            </p>
          )}
          <p className="tnum mt-3 text-2xl">{priceLabel(product.price)}</p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Inclusive of all taxes
          </p>

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

          <ul className="promise-list mt-8">
            <li>
              <Van />
              <span className="tnum">
                {shipsFree
                  ? "Ships free — this piece is over the threshold"
                  : `PKR 250 delivery, free over PKR ${rupees(site.freeShippingOver)}`}
              </span>
            </li>
            <li>
              <Wallet />
              <span>Cash on delivery, bank transfer, JazzCash or EasyPaisa</span>
            </li>
            <li>
              <Swap />
              <span>Seven-day exchange on anything unworn</span>
            </li>
          </ul>

          <div className="mt-9">
            {product.details.length > 0 && (
              <Fold title="Fabric and details" open>
                <ul className="space-y-2">
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </Fold>
            )}
            <Fold title="Size and fit">
              <p>
                Everything is cut loose over the body measurements on the{" "}
                <Link href="/shipping#sizes" className="underline underline-offset-4">
                  size guide
                </Link>
                . Between two sizes, take the smaller one — these are generous.
                Azad pieces run two sizes wider on purpose.
              </p>
            </Fold>
            <Fold title="Delivery, care and returns">
              <p>
                {site.shipping.majorCities} to Karachi, Lahore and Islamabad,{" "}
                {site.shipping.elsewhere} everywhere else. We call to confirm
                before the parcel goes out.
              </p>
              <p className="mt-3">
                Wash cold and hang in shade. Exchange an unworn, unwashed piece
                within seven days —{" "}
                <Link href="/shipping#returns" className="underline underline-offset-4">
                  the full policy
                </Link>
                .
              </p>
            </Fold>
          </div>
        </div>
      </div>

      {alsoIn.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 md:px-16 py-14 md:py-16">
          <h2 className="home-h2">Complete the look</h2>
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
