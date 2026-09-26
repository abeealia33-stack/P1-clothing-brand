"use client";

import Link from "next/link";
import ClothImage from "@/components/ClothImage";
import { useWishlist } from "@/components/useWishlist";
import { priceLabel } from "@/lib/format";

/**
 * The pieces someone has kept, newest first.
 *
 * There is no "add to cart" here on purpose: a piece needs a size and a
 * colour before it can go in a basket, and this list holds neither. The
 * button opens the piece, where those are chosen — which is one tap, and
 * honest about what is still to decide.
 */
export default function WishlistView() {
  const { items, ready, remove, clear } = useWishlist();

  // Before the browser's list has been read, saying "nothing saved" would be
  // a guess — and the wrong one for anyone who has saved something.
  if (!ready) {
    return (
      <p className="mt-6 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        Looking for your saved pieces…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-6">
        <p className="measure" style={{ color: "var(--color-ink-soft)" }}>
          Nothing saved yet. Tap the heart on any piece and it will wait for you
          here.
        </p>
        <Link href="/shop" className="btn btn-ink mt-6">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 flex items-baseline justify-between gap-4">
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {items.length} {items.length === 1 ? "piece" : "pieces"}, newest first.
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-sm underline underline-offset-4"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Clear all
        </button>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/product/${item.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden">
                <ClothImage src={item.photo} alt={item.name} />
              </div>
              <h2 className="mt-3 text-xl leading-snug">{item.name}</h2>
              <span className="tnum mt-0.5 block text-sm">{priceLabel(item.price)}</span>
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link href={`/product/${item.slug}`} className="text-sm underline underline-offset-4">
                Choose a size
              </Link>
              <button
                type="button"
                onClick={() => remove(item.slug)}
                aria-label={`Remove ${item.name} from saved`}
                className="text-sm underline underline-offset-2"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
