import { isCollectionSlug, type CollectionSlug } from "./types";

/**
 * The two photo sections on the home page that the owner fills from the admin:
 * a strip of three tall cards, and a pair of photographs side by side.
 *
 * Deliberately free of server imports — the admin editor is a client
 * component and needs the same shapes and defaults the storefront reads.
 *
 * They live in the Settings row's `banners` column, which used to hold a list
 * of single promo banners. Those were retired for these, and reusing the
 * column means deploying needs no database change: an old list reads as
 * nothing set up yet, and is replaced the first time the owner saves.
 */

/**
 * Where a card goes when it is tapped.
 *
 * A piece is stored by its id rather than its address, because the address is
 * made from the name and changes when the piece is renamed — a typed-in link
 * would quietly start leading nowhere. The address is looked up when the page
 * is drawn instead.
 */
export type BannerLink =
  | { kind: "shop" }
  | { kind: "collection"; slug: CollectionSlug }
  | { kind: "product"; id: string };

/** One photograph with the words over it and where it leads. */
export type BannerSlot = {
  /** "" while no photo has been uploaded. */
  image: string;
  /** Optional line over the photo; "" means just the button. */
  heading: string;
  buttonLabel: string;
  link: BannerLink;
};

export type HomeBanners = {
  strip: { show: boolean; heading: string; cards: BannerSlot[] };
  split: { show: boolean; panels: BannerSlot[] };
};

export const STRIP_CARDS = 3;
export const SPLIT_PANELS = 2;
export const DEFAULT_STRIP_HEADING = "Promotional Moments";
export const DEFAULT_BUTTON_LABEL = "Explore Now";

const emptySlot = (): BannerSlot => ({
  image: "",
  heading: "",
  buttonLabel: DEFAULT_BUTTON_LABEL,
  link: { kind: "shop" },
});

/** Both sections switched on and waiting for photos. */
export const emptyHomeBanners = (): HomeBanners => ({
  strip: {
    show: true,
    heading: DEFAULT_STRIP_HEADING,
    cards: Array.from({ length: STRIP_CARDS }, emptySlot),
  },
  split: {
    show: true,
    panels: Array.from({ length: SPLIT_PANELS }, emptySlot),
  },
});

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/** Anything that cannot be followed becomes a link to the whole shop. */
function normaliseLink(value: unknown): BannerLink {
  const link = record(value);
  if (link.kind === "collection" && typeof link.slug === "string" && isCollectionSlug(link.slug)) {
    return { kind: "collection", slug: link.slug };
  }
  if (link.kind === "product" && text(link.id)) {
    return { kind: "product", id: text(link.id) };
  }
  return { kind: "shop" };
}

function normaliseSlot(value: unknown): BannerSlot {
  const slot = record(value);
  return {
    image: text(slot.image),
    heading: text(slot.heading),
    // A cleared button reads as it does by default rather than an empty box.
    buttonLabel: text(slot.buttonLabel) || DEFAULT_BUTTON_LABEL,
    link: normaliseLink(slot.link),
  };
}

/** Exactly `count` slots, padding with empty ones or dropping extras. */
function slots(value: unknown, count: number): BannerSlot[] {
  const list = Array.isArray(value) ? value : [];
  return Array.from({ length: count }, (_, i) => normaliseSlot(list[i]));
}

/**
 * Whatever is in the column, as exactly three cards and two panels.
 *
 * Run on the way in as well as out, so a stored value is always in this shape
 * and nothing that reads it has to guard against a half-formed one.
 */
export function normaliseHomeBanners(value: unknown): HomeBanners {
  // The old list of single banners was an array; it is not this, so it
  // reads as nothing set up rather than being guessed into cards.
  if (Array.isArray(value)) return emptyHomeBanners();

  const source = record(value);
  const strip = record(source.strip);
  const split = record(source.split);

  return {
    strip: {
      show: strip.show !== false,
      heading: text(strip.heading) || DEFAULT_STRIP_HEADING,
      cards: slots(strip.cards, STRIP_CARDS),
    },
    split: {
      show: split.show !== false,
      panels: slots(split.panels, SPLIT_PANELS),
    },
  };
}

/** Every piece a banner points at, once — to look their addresses up together. */
export function linkedProductIds(banners: HomeBanners): string[] {
  const ids = [...banners.strip.cards, ...banners.split.panels].flatMap((slot) =>
    slot.link.kind === "product" ? [slot.link.id] : []
  );
  return [...new Set(ids)];
}

/**
 * The address a link leads to today.
 *
 * `productSlugs` holds only pieces that are live, so a card pointing at one
 * that has since been deleted or hidden goes to the shop rather than a page
 * that says it is not there.
 */
export function bannerHref(link: BannerLink, productSlugs: ReadonlyMap<string, string>): string {
  switch (link.kind) {
    case "collection":
      return `/shop?collection=${link.slug}`;
    case "product": {
      const slug = productSlugs.get(link.id);
      return slug ? `/product/${slug}` : "/shop";
    }
    default:
      return "/shop";
  }
}

/** A slot as the storefront draws it: the link already worked out. */
export type ShownSlot = { image: string; heading: string; buttonLabel: string; href: string };

const show = (slot: BannerSlot, productSlugs: ReadonlyMap<string, string>): ShownSlot => ({
  image: slot.image,
  heading: slot.heading,
  buttonLabel: slot.buttonLabel,
  href: bannerHref(slot.link, productSlugs),
});

/**
 * What the home page draws, or null for a section it should leave out.
 *
 * A section appears only once every one of its photos is in. Two cards in a
 * row built for three, or one half of a pair, reads as a broken page rather
 * than a smaller promotion — so a half-finished section waits in the admin
 * instead of going live.
 */
export function resolveHomeBanners(
  banners: HomeBanners,
  productSlugs: ReadonlyMap<string, string>
): {
  strip: { heading: string; cards: ShownSlot[] } | null;
  split: { panels: ShownSlot[] } | null;
} {
  const complete = (list: BannerSlot[]) => list.every((slot) => slot.image);
  const { strip, split } = banners;

  return {
    strip:
      strip.show && complete(strip.cards)
        ? { heading: strip.heading, cards: strip.cards.map((c) => show(c, productSlugs)) }
        : null,
    split:
      split.show && complete(split.panels)
        ? { panels: split.panels.map((p) => show(p, productSlugs)) }
        : null,
  };
}
