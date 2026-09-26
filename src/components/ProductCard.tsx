import Link from "next/link";
import ClothImage from "./ClothImage";
import WishlistButton from "./WishlistButton";
import type { Product } from "@/lib/types";
import { photoAlt, priceLabel } from "@/lib/format";

/**
 * No card container, no border, no radius, no shadow: the photograph is the
 * card and the type sits directly on the paper. The only motion is the photo
 * easing in slightly under a cursor.
 */
export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const low = product.stock > 0 && product.stock <= 6;

  return (
    /* The heart is a sibling of the link, not inside it: a button within an
       anchor is neither valid nor operable — the link swallows the click. */
    <div className="relative">
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <ClothImage
            src={product.photos[0] ?? ""}
            alt={photoAlt(product)}
            priority={priority}
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {/* On a desktop, the second photo on hover — usually the back or a
              detail, which is the next thing anyone wants to see. Phones never
              download it: there is no hover to earn it. */}
          {product.photos[1] && (
            <div className="card-second absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ClothImage src={product.photos[1]} alt="" />
            </div>
          )}
          {low && (
            <span
              className="absolute top-3 left-3 px-2 py-1 text-[0.6875rem] text-white"
              style={{ background: "var(--color-sage-deep)" }}
            >
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Stacked on phones, where two cards to a row leaves a name no space
            to sit beside a price; side by side once the column is wide
            enough. */}
        <div className="mt-3 sm:flex sm:items-baseline sm:justify-between sm:gap-3">
          <h3 className="text-xl leading-snug">{product.name}</h3>
          <span className="tnum mt-0.5 block text-sm sm:mt-0 sm:shrink-0">
            {priceLabel(product.price)}
          </span>
        </div>
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {product.colors.length > 1
            ? `${product.colors.length} colours`
            : (product.colors[0]?.name ?? "")}
        </p>
      </Link>

      <WishlistButton product={product} className="absolute top-3 right-3" />
    </div>
  );
}
