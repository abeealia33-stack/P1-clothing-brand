"use client";

import { useId } from "react";
import type { BannerLink } from "@/lib/banners";
import type { ProductChoice } from "@/lib/catalogue";
import type { CollectionSlug, ResolvedCollection } from "@/lib/types";

/**
 * Where a banner goes when it is tapped, picked rather than typed.
 *
 * A typed address was how the old banners worked, and it broke silently the
 * day a piece was renamed — the address is built from the name. A piece is
 * chosen here and stored by its id, so the banner follows it.
 */
export default function BannerLinkPicker({
  label = "Where it goes",
  link,
  onChange,
  collections,
  products,
}: {
  label?: string;
  link: BannerLink;
  onChange: (link: BannerLink) => void;
  collections: ResolvedCollection[];
  products: ProductChoice[];
}) {
  const id = useId();

  /* Switching kind lands on the first choice rather than on nothing, so the
     link is always somewhere real without a second step. */
  const setKind = (kind: BannerLink["kind"]) => {
    if (kind === "collection") onChange({ kind, slug: collections[0].slug });
    else if (kind === "product" && products[0]) onChange({ kind, id: products[0].id });
    else onChange({ kind: "shop" });
  };

  // A piece chosen earlier may since have been hidden or deleted.
  const missingPiece = link.kind === "product" && !products.some((p) => p.id === link.id);

  return (
    <div>
      <label className="block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        <select
          id={id}
          value={link.kind}
          onChange={(e) => setKind(e.target.value as BannerLink["kind"])}
          className="field"
        >
          <option value="shop">All pieces</option>
          <option value="collection">A collection</option>
          <option value="product" disabled={products.length === 0}>
            {products.length === 0 ? "A piece (none in the shop yet)" : "A piece"}
          </option>
        </select>

        {link.kind === "collection" && (
          <select
            aria-label="Which collection"
            value={link.slug}
            onChange={(e) =>
              onChange({ kind: "collection", slug: e.target.value as CollectionSlug })
            }
            className="field"
          >
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
                {c.inNav ? "" : " (hidden)"}
              </option>
            ))}
          </select>
        )}

        {link.kind === "product" && (
          <select
            aria-label="Which piece"
            value={missingPiece ? "" : link.id}
            onChange={(e) => onChange({ kind: "product", id: e.target.value })}
            className="field"
          >
            {missingPiece && (
              <option value="" disabled>
                Choose a piece
              </option>
            )}
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {missingPiece && (
        <p className="mt-1.5 text-xs" style={{ color: "var(--color-alert)" }}>
          The piece this pointed at is hidden or deleted, so it goes to the shop
          for now. Choose another.
        </p>
      )}
    </div>
  );
}
