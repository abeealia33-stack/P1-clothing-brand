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

/** One square in the carousel: a photograph with its name under it. */
export type BannerTile = { image: string; label: string; link: BannerLink };

/**
 * The parts of the home page the owner can put in whatever order she likes.
 *
 * The hero and the promises at the bottom are not here: they are the page's
 * frame rather than its contents, and a shop whose first screen can be moved
 * below the fold is a shop with a broken front door.
 */
export const homeBlocks = [
  "collections",
  "newIn",
  "dayPicker",
  "groupOrders",
  "pair",
  "carousel",
  "reels",
] as const;

export type HomeBlock = (typeof homeBlocks)[number];

/** What each block is called in the admin, in the words on the page itself. */
export const homeBlockLabels: Record<HomeBlock, string> = {
  collections: "Ways to get dressed",
  pair: "The pair (two photos)",
  newIn: "Just in",
  carousel: "The carousel",
  dayPicker: "Aaj ka din kaisa hai? (day picker)",
  groupOrders: "Made to match (group orders)",
  reels: "See it worn (reels)",
};

/**
 * "Aaj ka din kaisa hai?" — the shopper picks what their day looks like and
 * the pieces under it change. The owner chooses the pieces for each day and
 * the one line saying why they suit it.
 */
export const dayKeys = ["ghar", "work", "ammi", "bahar", "dawat"] as const;
export type DayKey = (typeof dayKeys)[number];

export const dayLabels: Record<DayKey, string> = {
  ghar: "Ghar pe aaram",
  work: "University / office",
  ammi: "Ammi ke ghar",
  bahar: "Bahar ghoomna",
  dawat: "Dawat",
};

/** Three pieces per day: a row on a desktop, and no scrolling to compare them. */
export const DAY_PIECES = 3;

export type DayPick = { reason: string; productIds: string[] };

export type HomeBanners = {
  /** The order the blocks above are drawn in, top to bottom. */
  order: HomeBlock[];
  /**
   * A panel of words beside a carousel of tiles — the shop's ranges, laid
   * out the way a lookbook contents page is.
   */
  strip: {
    show: boolean;
    /** Small line over the heading, e.g. "NEW THIS WEEK". Optional. */
    eyebrow: string;
    heading: string;
    /** A sentence or two under the heading. Optional. */
    text: string;
    buttonLabel: string;
    link: BannerLink;
    tiles: BannerTile[];
  };
  split: { show: boolean; panels: BannerSlot[] };
  days: Record<DayKey, DayPick>;
  /** The wide Hum rang photo; "" draws the illustration instead. */
  groupImage: string;
};

export const SPLIT_PANELS = 2;
/** Three abreast on a desktop, so fewer than three is a row, not a carousel. */
export const MIN_TILES = 3;
/** Past this the dots become a smear and nobody reaches the end. */
export const MAX_TILES = 12;
export const DEFAULT_CTA_LABEL = "Shop now";

const emptySlot = (): BannerSlot => ({
  image: "",
  heading: "",
  buttonLabel: "",
  link: { kind: "shop" },
});

const emptyTile = (): BannerTile => ({ image: "", label: "", link: { kind: "shop" } });

/** Both sections switched on and waiting for photos. */
export const emptyHomeBanners = (): HomeBanners => ({
  order: [...homeBlocks],
  strip: {
    show: true,
    eyebrow: "",
    heading: "",
    text: "",
    buttonLabel: DEFAULT_CTA_LABEL,
    link: { kind: "shop" },
    tiles: Array.from({ length: MIN_TILES }, emptyTile),
  },
  split: {
    show: true,
    panels: Array.from({ length: SPLIT_PANELS }, emptySlot),
  },
  days: emptyDays(),
  groupImage: "",
});

function emptyDays(): Record<DayKey, DayPick> {
  const day = (): DayPick => ({ reason: "", productIds: [] });
  return { ghar: day(), work: day(), ammi: day(), bahar: day(), dawat: day() };
}

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/* Wording that used to be filled in by default and was saved into every
   shop's settings. It read as template text on the live page, so it is
   dropped on the way out — a blank heading or button simply isn't drawn. */
const RETIRED_PLACEHOLDERS = new Set(["Promotional Moments", "Explore Now"]);
const owned = (value: unknown): string => {
  const words = text(value);
  return RETIRED_PLACEHOLDERS.has(words) ? "" : words;
};

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/** Anything that cannot be followed becomes a link to the whole shop. */
export function normaliseBannerLink(value: unknown): BannerLink {
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
    // Optional: the whole photo is the link, so no button is needed.
    buttonLabel: owned(slot.buttonLabel),
    link: normaliseBannerLink(slot.link),
  };
}

/**
 * The tiles as stored: however many there are, up to the cap. Unlike the
 * pair these are a list the owner adds to, so nothing is padded — an empty
 * one is a row she has not filled in yet, and is dropped when drawn.
 */
function tiles(value: unknown): BannerTile[] {
  const list = Array.isArray(value) ? value : [];
  return list.slice(0, MAX_TILES).map((entry) => {
    const tile = record(entry);
    return {
      image: text(tile.image),
      label: text(tile.label),
      link: normaliseBannerLink(tile.link),
    };
  });
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
  /* Anything that is not the shape below — the old list of single banners,
     which was an array, or a column that would not parse — reads as nothing
     set up yet rather than being guessed at. */
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptyHomeBanners();
  }

  const source = record(value);
  const strip = record(source.strip);
  const split = record(source.split);

  return {
    order: normaliseHomeOrder(source.order),
    strip: {
      show: strip.show !== false,
      eyebrow: text(strip.eyebrow),
      heading: owned(strip.heading),
      text: text(strip.text),
      buttonLabel: text(strip.buttonLabel) || DEFAULT_CTA_LABEL,
      link: normaliseBannerLink(strip.link),
      tiles: tiles(strip.tiles),
    },
    split: {
      show: split.show !== false,
      panels: slots(split.panels, SPLIT_PANELS),
    },
    days: normaliseDays(source.days),
    groupImage: text(source.groupImage),
  };
}

function normaliseDays(value: unknown): Record<DayKey, DayPick> {
  const source = record(value);
  const days = emptyDays();
  for (const key of dayKeys) {
    const day = record(source[key]);
    const ids = Array.isArray(day.productIds) ? day.productIds.map(text).filter(Boolean) : [];
    days[key] = { reason: text(day.reason), productIds: [...new Set(ids)].slice(0, DAY_PIECES) };
  }
  return days;
}

/**
 * Every block exactly once, in the order stored.
 *
 * Anything unknown is dropped. Anything missing — a block added to the site
 * since the owner last saved — goes in after the block it follows in the
 * default order, so it lands where it was designed to sit rather than at the
 * foot of the page, and she never has to notice it arriving.
 */
export function normaliseHomeOrder(value: unknown): HomeBlock[] {
  const stored = Array.isArray(value) ? value : [];
  const known = stored.filter(
    (entry): entry is HomeBlock =>
      typeof entry === "string" && (homeBlocks as readonly string[]).includes(entry)
  );
  const order = [...new Set(known)];
  homeBlocks.forEach((block, i) => {
    if (order.includes(block)) return;
    const before = homeBlocks.slice(0, i).reverse().find((b) => order.includes(b));
    order.splice(before ? order.indexOf(before) + 1 : 0, 0, block);
  });
  return order;
}

/** Every piece picked for the day picker, once. */
export function dayProductIds(banners: HomeBanners): string[] {
  return [...new Set(dayKeys.flatMap((key) => banners.days[key].productIds))];
}

/** Every piece a banner points at, once — to look their addresses up together. */
export function linkedProductIds(banners: HomeBanners): string[] {
  const ids = [
    banners.strip.link,
    ...banners.strip.tiles.map((t) => t.link),
    ...banners.split.panels.map((p) => p.link),
  ].flatMap((link) => (link.kind === "product" ? [link.id] : []));
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

/** A tile as the storefront draws it. */
export type ShownTile = { image: string; label: string; href: string };

/** The panel of words beside the carousel, and the carousel. */
export type ShownStrip = {
  eyebrow: string;
  heading: string;
  text: string;
  buttonLabel: string;
  href: string;
  tiles: ShownTile[];
};

const show = (slot: BannerSlot, productSlugs: ReadonlyMap<string, string>): ShownSlot => ({
  image: slot.image,
  heading: slot.heading,
  buttonLabel: slot.buttonLabel,
  href: bannerHref(slot.link, productSlugs),
});

/**
 * What the home page draws, or null for a section it should leave out.
 *
 * The pair appears only once both of its photos are in — one half of a pair
 * reads as a broken page rather than a smaller promotion. The carousel drops
 * the tiles with no photograph and appears once three are left, which is a
 * row on a desktop: fewer would be a carousel with nothing to scroll.
 */
export function resolveHomeBanners(
  banners: HomeBanners,
  productSlugs: ReadonlyMap<string, string>
): { strip: ShownStrip | null; split: { panels: ShownSlot[] } | null } {
  const { strip, split } = banners;
  const shownTiles = strip.tiles
    .filter((tile) => tile.image)
    .map((tile) => ({
      image: tile.image,
      label: tile.label,
      href: bannerHref(tile.link, productSlugs),
    }));

  return {
    strip:
      strip.show && shownTiles.length >= MIN_TILES
        ? {
            eyebrow: strip.eyebrow,
            heading: strip.heading,
            text: strip.text,
            buttonLabel: strip.buttonLabel,
            href: bannerHref(strip.link, productSlugs),
            tiles: shownTiles,
          }
        : null,
    split:
      split.show && split.panels.every((panel) => panel.image)
        ? { panels: split.panels.map((p) => show(p, productSlugs)) }
        : null,
  };
}
