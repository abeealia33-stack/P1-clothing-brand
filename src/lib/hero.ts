import { normaliseBannerLink, type BannerLink } from "./banners";

/**
 * The home page hero: a photograph and one button, nothing else. The photo
 * carries the brand; the tagline lives in the footer and on the About page.
 *
 * Free of server imports, like banners.ts, so the admin editor can share it.
 *
 * Stored in the Settings row's `heroImages` column, which has held three
 * shapes now: a bare list of slideshow images, then a single pair of photos,
 * and now a list of slides. All three are read here, so no deploy has ever
 * needed a database change and no owner has lost a photograph to one.
 */

export const heroPositions = ["center", "left"] as const;
export type HeroPosition = (typeof heroPositions)[number];

export const heroFocuses = ["top", "center", "bottom"] as const;
export type HeroFocus = (typeof heroFocuses)[number];

/** One photograph in the hero, with its own crop for a phone. */
export type HeroSlide = {
  /** "" while nothing has been uploaded; the storefront uses a placeholder. */
  desktopImage: string;
  /** "" means the phone shows the desktop photo, cropped. */
  mobileImage: string;
};

/** Past this nobody waits to see the end, and every one is a download. */
export const MAX_HERO_SLIDES = 5;

export type HeroSettings = {
  /** Shown in turn. The button below belongs to the hero, not to a slide. */
  slides: HeroSlide[];
  buttonLabel: string;
  link: BannerLink;
  position: HeroPosition;
  /** Which part of the photo stays in frame when it is cropped. */
  focus: HeroFocus;
};

export const DEFAULT_HERO_BUTTON = "Shop now";
export const MAX_HERO_BUTTON = 20;

export const emptySlide = (): HeroSlide => ({ desktopImage: "", mobileImage: "" });

export const emptyHero = (): HeroSettings => ({
  slides: [],
  buttonLabel: DEFAULT_HERO_BUTTON,
  link: { kind: "shop" },
  position: "center",
  focus: "center",
});

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const oneOf = <T extends string>(options: readonly T[], value: unknown, fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;

/** A photograph is only a slide if there is something to show. */
function slides(value: unknown): HeroSlide[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .map((entry) => {
      // The oldest shape: a bare list of image URLs, no phone crop.
      if (typeof entry === "string") {
        return { desktopImage: text(entry), mobileImage: "" };
      }
      const slide = (entry ?? {}) as Record<string, unknown>;
      return {
        desktopImage: text(slide.desktopImage),
        mobileImage: text(slide.mobileImage),
      };
    })
    .filter((slide) => slide.desktopImage)
    .slice(0, MAX_HERO_SLIDES);
}

export function normaliseHero(value: unknown): HeroSettings {
  // The oldest shape: the bare list the slideshow used to be stored as.
  if (Array.isArray(value)) return { ...emptyHero(), slides: slides(value) };
  if (!value || typeof value !== "object") return emptyHero();

  const source = value as Record<string, unknown>;
  /* The single pair that replaced the list, before slides replaced the pair.
     Read as the one slide it describes rather than dropped. */
  const stored = Array.isArray(source.slides)
    ? slides(source.slides)
    : slides([{ desktopImage: source.desktopImage, mobileImage: source.mobileImage }]);

  return {
    slides: stored,
    buttonLabel: text(source.buttonLabel).slice(0, MAX_HERO_BUTTON) || DEFAULT_HERO_BUTTON,
    link: normaliseBannerLink(source.link),
    position: oneOf(heroPositions, source.position, "center"),
    focus: oneOf(heroFocuses, source.focus, "center"),
  };
}
