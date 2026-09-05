import Link from "next/link";
import ClothImage from "./ClothImage";
import type { Product } from "@/lib/types";
import { priceLabel } from "@/lib/format";

/**
 * No card container, no border, no radius, no resting shadow: the photograph
 * is the card and the type sits directly on the paper. Depth arrives only when
 * a finger or cursor is on it.
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
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="lift relative aspect-[3/4] overflow-hidden">
        <ClothImage
          src={product.photos[0]}
          alt={`${product.name} in ${product.colors[0].name}`}
          priority={priority}
        />
        {low && (
          <span
            className="absolute top-3 left-3 px-2 py-1 text-[0.6875rem] text-white"
            style={{ background: "var(--color-sage-deep)" }}
          >
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Stacked on phones, where two cards to a row leaves a name no space to
          sit beside a price; side by side once the column is wide enough. */}
      <div className="mt-3 sm:flex sm:items-baseline sm:justify-between sm:gap-3">
        <h3 className="text-xl leading-snug">{product.name}</h3>
        <span className="tnum mt-0.5 block text-sm sm:mt-0 sm:shrink-0">
          {priceLabel(product.price)}
        </span>
      </div>
      <p className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        {product.colors.length > 1
          ? `${product.colors.length} colours`
          : product.colors[0].name}
      </p>
    </Link>
  );
}
