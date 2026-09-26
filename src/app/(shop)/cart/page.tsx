"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ClothImage from "@/components/ClothImage";
import FreeShipMeter from "@/components/FreeShipMeter";
import { useCart } from "@/components/useCart";
import { priceLabel, rupees } from "@/lib/format";
import { shippingFor } from "@/lib/shipping";

const LINE_OUT_MS = 300;

/** True when the device has asked for less movement. */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function CartPage() {
  const { lines, subtotal, setQty, remove, ready } = useCart();

  /* A removed line collapses before it goes, so the rows below do not jump
     up under the finger that just tapped Remove. */
  const [leaving, setLeaving] = useState<string | null>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (removeTimer.current) clearTimeout(removeTimer.current);
  }, []);

  const removeLine = (id: string) => {
    if (prefersReducedMotion()) {
      remove(id);
      return;
    }
    setLeaving(id);
    removeTimer.current = setTimeout(() => {
      remove(id);
      setLeaving(null);
    }, LINE_OUT_MS);
  };

  if (!ready) {
    return <div className="mx-auto max-w-3xl px-5 py-12" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-5xl">Your cart is empty</h1>
        <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
          Start with Rozana if you want something for tomorrow, or Ghar if you
          want to be comfortable tonight.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/shop?collection=rozana" className="btn btn-ink">
            Shop Rozana
          </Link>
          <Link href="/shop?collection=ghar" className="btn btn-quiet">
            Shop Ghar
          </Link>
        </div>
      </div>
    );
  }

  // The same helper the checkout charges from, so the cart cannot quote a
  // total the next page disagrees with.
  const shipping = shippingFor(subtotal);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      <h1 className="flex items-center gap-3 text-[2.25rem] md:text-[3.5rem]">
        <svg
          width="40"
          height="40"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.6 4h2.1l2 8.9h8.1l1.7-6.6H5.6" />
          <circle cx="8.4" cy="16.2" r="1.2" />
          <circle cx="14.2" cy="16.2" r="1.2" />
        </svg>
        Your cart
      </h1>

      <div className="mt-8">
        <FreeShipMeter subtotal={subtotal} />
      </div>

      <ul className="mt-8">
        {lines.map((line) => (
          <li
            key={line.id}
            className={`rule flex gap-4 py-5 first:border-t-0 first:pt-0 ${
              leaving === line.id ? "line-out" : ""
            }`}
          >
            <Link
              href={`/product/${line.slug}`}
              className="aspect-[3/4] w-20 shrink-0 overflow-hidden sm:w-24"
            >
              <ClothImage src={line.photo} alt={line.name} />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="truncate text-xl">
                  <Link href={`/product/${line.slug}`}>{line.name}</Link>
                </h2>
                {/* Keyed on the figure so the animation replays whenever the
                    figure itself changes, and never otherwise. */}
                <span key={line.qty} className="tick tnum shrink-0 text-sm">
                  {priceLabel(line.price * line.qty)}
                </span>
              </div>
              <p className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                {line.color}, size {line.size}
              </p>

              <div className="mt-3 flex items-center gap-4">
                <div
                  className="flex items-center border"
                  style={{ borderColor: "var(--color-line)" }}
                >
                  <button
                    type="button"
                    onClick={() => setQty(line.id, line.qty - 1)}
                    aria-label={`Reduce ${line.name} quantity`}
                    className="h-10 w-10 text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="tnum w-8 text-center text-sm" aria-live="polite">
                    <span key={line.qty} className="tick block">
                      {line.qty}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(line.id, line.qty + 1)}
                    disabled={line.qty >= 10}
                    aria-label={`Increase ${line.name} quantity`}
                    className="h-10 w-10 text-lg leading-none disabled:opacity-35"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  className="text-sm underline underline-offset-4"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dl className="rule tnum mt-4 space-y-2 pt-5 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd key={subtotal} className="tick">
            {priceLabel(subtotal)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd key={shipping} className="tick">
            {shipping === 0 ? "Free" : `PKR ${rupees(shipping)}`}
          </dd>
        </div>
        <div className="rule flex justify-between pt-3 text-base">
          <dt>Total</dt>
          <dd key={subtotal + shipping} className="tick">
            {priceLabel(subtotal + shipping)}
          </dd>
        </div>
      </dl>

      <Link href="/checkout" className="btn btn-ink mt-7 w-full">
        Checkout
      </Link>
      <p className="mt-3 text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>
        Pay cash when your order arrives. No payment needed now.
      </p>
    </div>
  );
}
