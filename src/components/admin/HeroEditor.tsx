"use client";

import { useId } from "react";
import BannerLinkPicker from "./BannerLinkPicker";
import BannerPhoto from "./BannerPhoto";
import { MIN_SIZES } from "@/lib/image-size";
import {
  emptySlide,
  MAX_HERO_BUTTON,
  MAX_HERO_SLIDES,
  type HeroFocus,
  type HeroPosition,
  type HeroSettings,
  type HeroSlide,
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
  const setSlides = (slides: HeroSlide[]) => set({ slides });
  const setSlide = (index: number, patch: Partial<HeroSlide>) =>
    setSlides(hero.slides.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {hero.slides.map((slide, i) => (
          <div key={i} className="border p-4" style={{ borderColor: "var(--color-line)" }}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                Photo {i + 1}
                {i === 0 && (
                  <span style={{ color: "var(--color-ink-soft)" }}> — shown first</span>
                )}
              </p>
              <button
                type="button"
                onClick={() => setSlides(hero.slides.filter((_, j) => j !== i))}
                className="text-xs underline underline-offset-4"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Remove
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
              <div>
                <p className="mb-1 text-sm font-medium">On a computer</p>
                <BannerPhoto
                  image={slide.desktopImage}
                  onUploaded={(desktopImage) => setSlide(i, { desktopImage })}
                  onBusyChange={onBusyChange}
                  purpose="feature"
                  frame="aspect-video"
                  sizeHint="A wide photo, around 1920 × 860 px, JPG or WebP under 400 KB."
                  minSize={MIN_SIZES.heroDesktop}
                />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">On a phone (optional)</p>
                <BannerPhoto
                  image={slide.mobileImage}
                  onUploaded={(mobileImage) => setSlide(i, { mobileImage })}
                  onBusyChange={onBusyChange}
                  purpose="feature"
                  frame="aspect-[4/5]"
                  sizeHint="1080 × 1350 px (4:5). Blank crops the wide photo."
                  minSize={MIN_SIZES.heroMobile}
                />
                {slide.mobileImage && (
                  <button
                    type="button"
                    onClick={() => setSlide(i, { mobileImage: "" })}
                    className="mt-1 text-xs underline underline-offset-4"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    Remove phone photo
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {hero.slides.length < MAX_HERO_SLIDES ? (
          <button
            type="button"
            onClick={() => setSlides([...hero.slides, emptySlide()])}
            className="btn btn-quiet"
          >
            {hero.slides.length === 0 ? "Add a photo" : "Add another photo"}
          </button>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            {MAX_HERO_SLIDES} photos is as many as the hero shows.
          </p>
        )}

        {hero.slides.length > 1 && (
          <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            They fade from one to the next every few seconds. Someone who has
            asked their phone to reduce motion sees the first and no more.
          </p>
        )}
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
