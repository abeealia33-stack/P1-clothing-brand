"use client";

import { useId, useState } from "react";
import type { BannerLink, BannerSlot } from "@/lib/banners";
import type { ProductChoice } from "@/lib/catalogue";
import type { CollectionSlug, ResolvedCollection } from "@/lib/types";

/**
 * One photograph in a home page banner: the picture, the words over it, and
 * where tapping it goes.
 *
 * "Where it goes" is picked rather than typed. A typed address was how the
 * old banners worked, and it broke silently the day a piece was renamed —
 * a piece is now chosen from the list and stored by its id, so the banner
 * follows it to whatever it is called next.
 */
export default function BannerSlotEditor({
  label,
  slot,
  onChange,
  onBusyChange,
  purpose,
  frame,
  sizeHint,
  collections,
  products,
}: {
  label: string;
  slot: BannerSlot;
  onChange: (slot: BannerSlot) => void;
  /** Told when an upload starts and ends, so the form can hold its Save. */
  onBusyChange: (busy: boolean) => void;
  /** How large the stored photo may be: see IMAGE_WIDTHS in lib/uploads.ts. */
  purpose: "product" | "feature";
  /** The preview's shape, matching how the photo is cropped on the page. */
  frame: string;
  sizeHint: string;
  collections: ResolvedCollection[];
  products: ProductChoice[];
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const set = (patch: Partial<BannerSlot>) => onChange({ ...slot, ...patch });

  const upload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    onBusyChange(true);
    const body = new FormData();
    body.set("file", file);
    body.set("purpose", purpose);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Upload failed.");
      set({ image: result.url });
    } catch (error) {
      // Said beside the photo: a failed upload that only showed as "no photo
      // yet" looked the same as never having tried.
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      onBusyChange(false);
    }
  };

  /* Switching kind lands on the first choice rather than on nothing, so the
     link is always somewhere real without a second step. */
  const setKind = (kind: BannerLink["kind"]) => {
    if (kind === "collection") set({ link: { kind, slug: collections[0].slug } });
    else if (kind === "product" && products[0]) set({ link: { kind, id: products[0].id } });
    else set({ link: { kind: "shop" } });
  };

  // A piece chosen earlier may since have been hidden or deleted.
  const link = slot.link;
  const missingPiece = link.kind === "product" && !products.some((p) => p.id === link.id);

  return (
    <div
      className="grid gap-4 border p-4 sm:grid-cols-[9rem_1fr]"
      style={{ borderColor: "var(--color-line)" }}
    >
      <div>
        <p className="mb-2 text-sm font-medium">{label}</p>
        <div
          className={`relative flex items-center justify-center overflow-hidden border ${frame}`}
          style={{ borderColor: "var(--color-line)", background: "var(--color-khaddar)" }}
        >
          {slot.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slot.image}
              alt=""
              className="h-full w-full object-cover"
              style={{ opacity: uploading ? 0.45 : 1 }}
            />
          )}
          {uploading && <span className="absolute text-xs">Uploading</span>}
          {!slot.image && !uploading && (
            <span className="px-2 text-center text-xs" style={{ color: "var(--color-ink-soft)" }}>
              No photo yet
            </span>
          )}
        </div>
        <label htmlFor={`${id}-file`} className="btn btn-quiet mt-2 w-full cursor-pointer">
          {slot.image ? "Replace" : "Choose photo"}
        </label>
        <input
          id={`${id}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
        <p className="mt-1.5 text-xs" style={{ color: "var(--color-ink-soft)" }}>
          {sizeHint}
        </p>
        {uploadError && (
          <p role="alert" className="mt-1.5 text-xs" style={{ color: "var(--color-alert)" }}>
            {uploadError}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium" htmlFor={`${id}-heading`}>
            Headline (optional)
          </label>
          <input
            id={`${id}-heading`}
            value={slot.heading}
            onChange={(e) => set({ heading: e.target.value })}
            placeholder="Eid lawn is here"
            className="field mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor={`${id}-button`}>
            Button text
          </label>
          <input
            id={`${id}-button`}
            value={slot.buttonLabel}
            onChange={(e) => set({ buttonLabel: e.target.value })}
            className="field mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor={`${id}-kind`}>
            Where it goes
          </label>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            <select
              id={`${id}-kind`}
              value={slot.link.kind}
              onChange={(e) => setKind(e.target.value as BannerLink["kind"])}
              className="field"
            >
              <option value="shop">All pieces</option>
              <option value="collection">A collection</option>
              <option value="product" disabled={products.length === 0}>
                {products.length === 0 ? "A piece (none in the shop yet)" : "A piece"}
              </option>
            </select>

            {slot.link.kind === "collection" && (
              <select
                aria-label="Which collection"
                value={slot.link.slug}
                onChange={(e) =>
                  set({ link: { kind: "collection", slug: e.target.value as CollectionSlug } })
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

            {slot.link.kind === "product" && (
              <select
                aria-label="Which piece"
                value={missingPiece ? "" : slot.link.id}
                onChange={(e) => set({ link: { kind: "product", id: e.target.value } })}
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
              The piece this pointed at is hidden or deleted, so it goes to the
              shop for now. Choose another.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
