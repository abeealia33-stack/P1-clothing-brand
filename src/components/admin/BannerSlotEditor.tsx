"use client";

import { useId } from "react";
import BannerLinkPicker from "./BannerLinkPicker";
import BannerPhoto from "./BannerPhoto";
import type { BannerSlot } from "@/lib/banners";
import type { ProductChoice } from "@/lib/catalogue";
import type { ResolvedCollection } from "@/lib/types";

/**
 * One half of the pair: the photograph, the words over it, and where it goes.
 */
export default function BannerSlotEditor({
  label,
  slot,
  onChange,
  onBusyChange,
  collections,
  products,
}: {
  label: string;
  slot: BannerSlot;
  onChange: (slot: BannerSlot) => void;
  onBusyChange: (busy: boolean) => void;
  collections: ResolvedCollection[];
  products: ProductChoice[];
}) {
  const id = useId();
  const set = (patch: Partial<BannerSlot>) => onChange({ ...slot, ...patch });

  return (
    <div
      className="grid gap-4 border p-4 sm:grid-cols-[9rem_1fr]"
      style={{ borderColor: "var(--color-line)" }}
    >
      <div>
        <p className="mb-2 text-sm font-medium">{label}</p>
        <BannerPhoto
          image={slot.image}
          onUploaded={(image) => set({ image })}
          onBusyChange={onBusyChange}
          purpose="feature"
          frame="aspect-square"
          sizeHint="2000 × 2000 px, square — keep the subject away from the edges"
        />
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

        <BannerLinkPicker
          link={slot.link}
          onChange={(link) => set({ link })}
          collections={collections}
          products={products}
        />
      </div>
    </div>
  );
}
