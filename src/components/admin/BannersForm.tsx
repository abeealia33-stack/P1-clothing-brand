"use client";

import { useActionState, useState } from "react";
import BannerSlotEditor from "./BannerSlotEditor";
import FormErrors from "./FormErrors";
import { saveBannersAction, type BannersFormState } from "@/app/admin/banners/actions";
import type { BannerSlot, HomeBanners } from "@/lib/banners";
import type { ProductChoice } from "@/lib/catalogue";
import type { ResolvedCollection } from "@/lib/types";

/**
 * Whether a section will be on the home page once saved, in words.
 *
 * The home page holds a section back until all of its photos are in, so
 * without this a strip with two photos out of three would save cleanly and
 * then simply not appear — the same silence that made a product look like it
 * would not save.
 */
function Status({ show, slots }: { show: boolean; slots: BannerSlot[] }) {
  const missing = slots.filter((slot) => !slot.image).length;
  const [text, colour] = !show
    ? ["Switched off — not on the home page.", "var(--color-ink-soft)"]
    : missing > 0
      ? [
          `Not on the home page yet — add ${missing} more ${missing === 1 ? "photo" : "photos"}.`,
          "var(--color-alert)",
        ]
      : ["All photos in — shows on the home page.", "var(--color-sage-deep)"];

  return (
    <p className="mt-1 text-sm" style={{ color: colour }}>
      {text}
    </p>
  );
}

export default function BannersForm({
  initial,
  collections,
  products,
}: {
  initial: HomeBanners;
  collections: ResolvedCollection[];
  products: ProductChoice[];
}) {
  const [state, action, pending] = useActionState<BannersFormState, FormData>(
    saveBannersAction,
    {}
  );
  const [banners, setBanners] = useState(initial);
  // Uploads still running. Saving now would store the section without them.
  const [busy, setBusy] = useState(0);
  const onBusyChange = (started: boolean) => setBusy((n) => n + (started ? 1 : -1));

  const setCard = (index: number, slot: BannerSlot) =>
    setBanners((b) => ({
      ...b,
      strip: { ...b.strip, cards: b.strip.cards.map((c, i) => (i === index ? slot : c)) },
    }));

  const setPanel = (index: number, slot: BannerSlot) =>
    setBanners((b) => ({
      ...b,
      split: { ...b.split, panels: b.split.panels.map((p, i) => (i === index ? slot : p)) },
    }));

  return (
    <form action={action} className="mt-8 max-w-3xl">
      <input type="hidden" name="banners" value={JSON.stringify(banners)} />
      <FormErrors errors={state.errors} />

      <fieldset className="border-0 p-0">
        <legend className="text-2xl">The strip of three</legend>
        <p className="measure mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Three tall photos in a row, under &ldquo;Just in&rdquo;. It appears
          once all three have a photo.
        </p>
        <Status show={banners.strip.show} slots={banners.strip.cards} />

        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={banners.strip.show}
            onChange={(e) =>
              setBanners((b) => ({ ...b, strip: { ...b.strip, show: e.target.checked } }))
            }
            className="h-4 w-4 accent-[var(--color-sage-deep)]"
          />
          <span className="text-sm">Show on the home page</span>
        </label>

        <div className="mt-4">
          <label htmlFor="strip-heading" className="block text-sm font-medium">
            Heading above the three
          </label>
          <input
            id="strip-heading"
            value={banners.strip.heading}
            onChange={(e) =>
              setBanners((b) => ({ ...b, strip: { ...b.strip, heading: e.target.value } }))
            }
            className="field mt-1"
          />
        </div>

        <div className="mt-5 space-y-4">
          {banners.strip.cards.map((card, i) => (
            <BannerSlotEditor
              key={i}
              label={`Card ${i + 1}`}
              slot={card}
              onChange={(slot) => setCard(i, slot)}
              onBusyChange={onBusyChange}
              purpose="product"
              frame="aspect-[3/4]"
              sizeHint="1200 × 1600 px, portrait"
              collections={collections}
              products={products}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="rule mt-10 border-0 p-0 pt-8">
        <legend className="text-2xl">The pair</legend>
        <p className="measure mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Two photos side by side on a dark band, under the collections. The
          left one&rsquo;s words sit on the left, the right one&rsquo;s on the
          right. It appears once both have a photo.
        </p>
        <Status show={banners.split.show} slots={banners.split.panels} />

        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={banners.split.show}
            onChange={(e) =>
              setBanners((b) => ({ ...b, split: { ...b.split, show: e.target.checked } }))
            }
            className="h-4 w-4 accent-[var(--color-sage-deep)]"
          />
          <span className="text-sm">Show on the home page</span>
        </label>

        <div className="mt-5 space-y-4">
          {banners.split.panels.map((panel, i) => (
            <BannerSlotEditor
              key={i}
              label={i === 0 ? "Left photo" : "Right photo"}
              slot={panel}
              onChange={(slot) => setPanel(i, slot)}
              onBusyChange={onBusyChange}
              purpose="feature"
              frame="aspect-square"
              sizeHint="2000 × 2000 px, square — keep the subject away from the edges"
              collections={collections}
              products={products}
            />
          ))}
        </div>
      </fieldset>

      <div className="rule mt-10 flex flex-wrap items-center gap-3 pt-6">
        <button type="submit" disabled={pending || busy > 0} className="btn btn-ink">
          {pending ? "Saving" : busy > 0 ? "Waiting for photos" : "Save"}
        </button>
      </div>
    </form>
  );
}
