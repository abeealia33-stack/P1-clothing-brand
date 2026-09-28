"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import WishlistButton from "./WishlistButton";
import { useCart } from "./useCart";
import type { Product } from "@/lib/types";
import { priceLabel } from "@/lib/format";

/**
 * Colour and size selectors plus the bar that follows you down the page.
 * They live in one component because the bar cannot add anything until the
 * selectors have said what.
 */
export default function ProductBuy({ product }: { product: Product }) {
  const { add } = useCart();
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  /* Separate from `added`: the button says "Added" for a moment and then
     offers itself again, while the line underneath stays put so the way to
     the cart does not disappear from under the cursor. */
  const [justAdded, setJustAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soldOut = product.stock === 0;

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const addToCart = () => {
    if (!size || soldOut) return;
    add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      size,
      color,
      photo: product.photos[0] ?? "",
      qty,
    });
    setAdded(true);
    setJustAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <>
      <div className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="field-label">
            Colour<span className="sr-only">:</span>
          </h2>
          <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            {color}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {product.colors.map((c) => {
            const on = c.name === color;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                aria-pressed={on}
                title={c.name}
                className="flex h-11 w-11 items-center justify-center rounded-full transition-shadow"
                style={{
                  boxShadow: on
                    ? "inset 0 0 0 1.5px var(--color-ink)"
                    : "inset 0 0 0 1px var(--color-line)",
                }}
              >
                <span
                  className="block h-7 w-7 rounded-full"
                  style={{
                    background: c.hex,
                    boxShadow: "inset 0 0 0 1px rgba(44,44,44,.12)",
                  }}
                />
                <span className="sr-only">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="field-label">Size</h2>
          <Link
            href="/shipping#sizes"
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Size guide
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const on = s === size;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={on}
                className="tnum h-12 min-w-14 border px-4 text-sm transition-colors"
                style={
                  on
                    ? {
                        background: "var(--color-ink)",
                        color: "var(--color-paper)",
                        borderColor: "var(--color-ink)",
                      }
                    : { borderColor: "var(--color-line)" }
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <Link href="/customize" className="measure-link mt-5">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 17l14-14 4 4-14 14H3v-4Z M13 7l4 4" />
        </svg>
        Rather have it made to fit you? Send your measurements
      </Link>

      {/* How many, beside what is left, so the two numbers are read together. */}
      <div className="mt-6 hidden items-center gap-5 md:flex">
        <div className="qty">
          <button
            type="button"
            onClick={() => setQty((n) => Math.max(1, n - 1))}
            disabled={qty <= 1}
            aria-label="One fewer"
          >
            −
          </button>
          <span className="tnum" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((n) => Math.min(10, n + 1))}
            disabled={qty >= 10 || (product.stock > 0 && qty >= product.stock)}
            aria-label="One more"
          >
            +
          </button>
        </div>
        {product.stock > 0 && product.stock <= 6 && (
          <p className="tnum text-sm" style={{ color: "var(--color-alert)" }}>
            Only {product.stock} left
          </p>
        )}
      </div>

      {/* Sits above the tab bar on phones; becomes an ordinary button on
          desktop, where the whole page is already in view. */}
      <div
        className="fixed inset-x-0 bottom-tabbar z-40 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur-sm md:static md:mt-9 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"

      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 md:gap-5">
          <div className="md:hidden">
            <p className="tnum text-lg leading-tight">{priceLabel(product.price)}</p>
            <p className="text-xs leading-tight" style={{ color: "var(--color-ink-soft)" }}>
              {size ? `Size ${size}` : "Pick a size"}
            </p>
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={soldOut || !size}
            className="btn btn-buy ml-auto flex-1 md:ml-0 md:w-full"
          >
            {soldOut
              ? "Sold out"
              : !size
                ? "Pick a size"
                : justAdded
                  ? "Added"
                  : `Add to bag · ${priceLabel(product.price * qty)}`}
          </button>

          {/* Saving needs no size, so it stays available on a piece that is
              sold out — which is the moment someone most wants to keep it. */}
          <WishlistButton product={product} variant="full" className="shrink-0" />
        </div>

        {added && (
          <p
            role="status"
            className="settle mx-auto mt-2 flex max-w-7xl items-center gap-3 text-sm"
          >
            <span style={{ color: "var(--color-sage-deep)" }}>Added to your cart.</span>
            <Link href="/cart" className="underline underline-offset-4">
              Go to cart
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
