import { normaliseBannerLink, type BannerLink } from "./banners";

/**
 * The home page hero: a photograph and one button, nothing else. The photo
 * carries the brand; the tagline lives in the footer and on the About page.
 *
 * Free of server imports, like banners.ts, so the admin editor can share it.
 *
 * Stored in the Settings row's `heroImages` column, which used to hold a list
 * of slideshow images. Reusing it means deploying needs no database change:
 * an old list reads as its first image becoming the desktop photo.
 */

export const heroPositions = ["center", "left"] as const;
export type HeroPosition = (typeof heroPositions)[number];

export const heroFocuses = ["top", "center", "bottom"] as const;
export type HeroFocus = (typeof heroFocuses)[number];

export type HeroSettings = {
  /** "" while nothing has been uploaded; the storefront uses a placeholder. */
  desktopImage: string;
  /** "" means the phone shows the desktop photo, cropped. */
  mobileImage: string;
  buttonLabel: string;
  link: BannerLink;
  position: HeroPosition;
  /** Which part of the photo stays in frame when it is cropped. */
  focus: HeroFocus;
};

export const DEFAULT_HERO_BUTTON = "Shop now";
export const MAX_HERO_BUTTON = 20;

export const emptyHero = (): HeroSettings => ({
  desktopImage: "",
  mobileImage: "",
  buttonLabel: DEFAULT_HERO_BUTTON,
  link: { kind: "shop" },
  position: "center",
  focus: "center",
});

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const oneOf = <T extends string>(options: readonly T[], value: unknown, fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;

export function normaliseHero(value: unknown): HeroSettings {
  // The old slideshow list: keep its first photo so the live hero survives
  // the deploy, and let the owner add the rest from the new fields.
  if (Array.isArray(value)) {
    return { ...emptyHero(), desktopImage: text(value.find((v) => text(v))) };
  }
  if (!value || typeof value !== "object") return emptyHero();

  const source = value as Record<string, unknown>;
  return {
    desktopImage: text(source.desktopImage),
    mobileImage: text(source.mobileImage),
    buttonLabel: text(source.buttonLabel).slice(0, MAX_HERO_BUTTON) || DEFAULT_HERO_BUTTON,
    link: normaliseBannerLink(source.link),
    position: oneOf(heroPositions, source.position, "center"),
    focus: oneOf(heroFocuses, source.focus, "center"),
  };
}
