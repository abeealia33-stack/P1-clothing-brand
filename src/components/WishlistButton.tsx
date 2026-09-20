"use client";

import { useWishlist } from "./useWishlist";
import type { Product } from "@/lib/types";

/**
 * The heart. One button for both directions — tapping a filled one is how
 * anyone expects to change their mind.
 *
 * Until the saved list has been read out of the browser it draws as unsaved,
 * which is what the server rendered: a heart that fills in a beat after the
 * page arrives is honest, one that flickers from filled to empty is not.
 */
export default function WishlistButton({
  product,
  variant = "icon",
  className = "",
}: {
  product: Pick<Product, "slug" | "name" | "price" | "photos">;
  /** "icon" sits over a photograph; "full" stands beside Add to cart. */
  variant?: "icon" | "full";
  className?: string;
}) {
  const { has, ready, toggle } = useWishlist();
  const saved = ready && has(product.slug);

  const save = () =>
    toggle({
      slug: product.slug,
      name: product.name,
      price: product.price,
      photo: product.photos[0] ?? "",
    });

  const label = saved ? `Remove ${product.name} from saved` : `Save ${product.name}`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={save}
        aria-pressed={saved}
        aria-label={label}
        className={`btn btn-quiet gap-2 ${className}`}
      >
        <Heart filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={save}
      aria-pressed={saved}
      aria-label={label}
      /* Over a photograph, so it carries its own pale disc rather than
         relying on whatever the picture happens to be behind it. */
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${className}`}
      style={{
        background: "rgba(245,240,235,.86)",
        color: saved ? "var(--color-alert)" : "var(--color-ink)",
      }}
    >
      <Heart filled={saved} />
    </button>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.3s-7.5-4.6-7.5-9.4A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 7.5 2.9c0 4.8-7.5 9.4-7.5 9.4Z" />
    </svg>
  );
}
