"use client";

import Link from "next/link";
import { useEffect } from "react";
import { whatsappLink } from "@/lib/site";

/**
 * What a shopper sees when something on the storefront throws — most
 * importantly mid-checkout, where the default error screen would read as
 * "your money went somewhere". It says what is and is not true, and offers
 * the two ways out: try again, or talk to a person.
 */
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-5xl">Something went wrong at our end</h1>
      <p className="measure mt-4" style={{ color: "var(--color-ink-soft)" }}>
        Nothing has been charged and no order was placed. Your cart is still
        here — try again, and if it keeps happening, message us and we will
        take the order over WhatsApp.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-ink">
          Try again
        </button>
        <a
          href={whatsappLink("Salam! Something went wrong on the website.")}
          className="btn btn-quiet"
        >
          Message on WhatsApp
        </a>
        <Link href="/" className="btn btn-quiet">
          Back to the shop
        </Link>
      </div>

      {error.digest && (
        <p className="tnum mt-8 text-xs" style={{ color: "var(--color-ink-soft)" }}>
          If you message us, quote {error.digest}
        </p>
      )}
    </div>
  );
}
