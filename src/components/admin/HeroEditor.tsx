"use client";

import { useId } from "react";
import BannerLinkPicker from "./BannerLinkPicker";
import BannerPhoto from "./BannerPhoto";
import { MIN_SIZES } from "@/lib/image-size";
import {
  MAX_HERO_BUTTON,
  type HeroFocus,
  type HeroPosition,
  type HeroSettings,
} from "@/lib/hero";
import type { ProductChoice } from "@/lib/catalogue";
import type { ResolvedCollection } from "@/lib/types";

const POSITION_LABELS: Record<HeroPosition, string> = {
  center: "Bottom centre",
  left: "Bottom left",
};

const FOCUS_LABELS: Record<HeroFocus, string> = {
  top: "Top",
  center: "Centre",
  bottom: "Bottom",
};

/** The hero's six settings: two photos, the button, where it sits, and the crop. */
export default function HeroEditor({
  hero,
  onChange,
  onBusyChange,
  collections,
  products,
}: {
  hero: HeroSettings;
  onChange: (hero: HeroSettings) => void;
  onBusyChange: (busy: boolean) => void;
  collections: ResolvedCollection[];
  products: ProductChoice[];
}) {
  const id = useId();
  const set = (patch: Partial<HeroSettings>) => onChange({ ...hero, ...patch });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="mb-1 text-sm font-medium">Desktop photo</p>
          <BannerPhoto
            image={hero.desktopImage}
            onUploaded={(url) => set({ desktopImage: url })}
            onBusyChange={onBusyChange}
            purpose="feature"
            frame="aspect-video"
            sizeHint="2400 × 1350 px (16:9), JPG or WebP, under 400 KB."
            minSize={MIN_SIZES.heroDesktop}
          />
        </div>
        <div>
          <p className="mb-1 text-sm font-medium">Phone photo (optional)</p>
          <BannerPhoto
            image={hero.mobileImage}
            onUploaded={(url) => set({ mobileImage: url })}
            onBusyChange={onBusyChange}
            purpose="feature"
            frame="aspect-[4/5]"
            sizeHint="1080 × 1350 px (4:5), under 250 KB. Blank uses the desktop photo."
            minSize={MIN_SIZES.heroMobile}
          />
          {hero.mobileImage && (
            <button
              type="button"
              onClick={() => set({ mobileImage: "" })}
              className="mt-1 text-xs underline underline-offset-4"
              style={{ color: "var(--color-ink-soft)" }}
            >
              Remove phone photo
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium" htmlFor={`${id}-button`}>
            Button text
          </label>
          <input
            id={`${id}-button`}
            value={hero.buttonLabel}
            maxLength={MAX_HERO_BUTTON}
            onChange={(e) => set({ buttonLabel: e.target.value })}
            placeholder="Shop now"
            className="field mt-1"
          />
          <p className="mt-1 text-xs" style={{ color: "var(--color-ink-soft)" }}>
            Up to {MAX_HERO_BUTTON} characters, shown in capitals.
          </p>
        </div>

        <BannerLinkPicker
          label="Button link"
          link={hero.link}
          onChange={(link) => set({ link })}
          collections={collections}
          products={products}
        />

        <div>
          <label className="block text-sm font-medium" htmlFor={`${id}-position`}>
            Button position
          </label>
          <select
            id={`${id}-position`}
            value={hero.position}
            onChange={(e) => set({ position: e.target.value as HeroPosition })}
            className="field mt-1"
          >
            {Object.entries(POSITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor={`${id}-focus`}>
            Keep in frame when cropped
          </label>
          <select
            id={`${id}-focus`}
            value={hero.focus}
            onChange={(e) => set({ focus: e.target.value as HeroFocus })}
            className="field mt-1"
          >
            {Object.entries(FOCUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label} of the photo
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
