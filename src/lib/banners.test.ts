import { describe, expect, it } from "vitest";
import {
  bannerHref,
  DEFAULT_BUTTON_LABEL,
  DEFAULT_STRIP_HEADING,
  emptyHomeBanners,
  linkedProductIds,
  normaliseHomeBanners,
  resolveHomeBanners,
  type HomeBanners,
} from "./banners";

/**
 * The home page banners are stored as JSON the owner shapes from the admin,
 * in a column that used to hold a different shape entirely. These check that
 * whatever is in there comes out as exactly three cards and two panels, and
 * that a link never leads to a page that is not there.
 */

const slot = (image: string, link: HomeBanners["strip"]["cards"][number]["link"] = { kind: "shop" }) => ({
  image,
  heading: "",
  buttonLabel: "Explore Now",
  link,
});

describe("normaliseHomeBanners", () => {
  it("reads the old list of single banners as nothing set up yet", () => {
    const old = [{ image: "/a.jpg", heading: "Sale", subtext: "", buttonLabel: "Shop", href: "/shop" }];
    expect(normaliseHomeBanners(old)).toEqual(emptyHomeBanners());
  });

  it("reads anything that is not an object as nothing set up yet", () => {
    expect(normaliseHomeBanners(null)).toEqual(emptyHomeBanners());
    expect(normaliseHomeBanners("banners")).toEqual(emptyHomeBanners());
  });

  it("always has three cards and two panels, however many were stored", () => {
    const banners = normaliseHomeBanners({
      strip: { cards: [slot("/1.jpg")] },
      split: { panels: [slot("/a.jpg"), slot("/b.jpg"), slot("/c.jpg")] },
    });
    expect(banners.strip.cards).toHaveLength(3);
    expect(banners.split.panels).toHaveLength(2);
    expect(banners.strip.cards[0].image).toBe("/1.jpg");
    expect(banners.strip.cards[1].image).toBe("");
    expect(banners.split.panels.map((p) => p.image)).toEqual(["/a.jpg", "/b.jpg"]);
  });

  it("puts the wording back when a field is cleared", () => {
    const banners = normaliseHomeBanners({
      strip: { heading: "   ", cards: [{ ...slot("/1.jpg"), buttonLabel: "" }] },
    });
    expect(banners.strip.heading).toBe(DEFAULT_STRIP_HEADING);
    expect(banners.strip.cards[0].buttonLabel).toBe(DEFAULT_BUTTON_LABEL);
  });

  it("keeps the owner's own wording, trimmed", () => {
    const banners = normaliseHomeBanners({
      strip: { heading: "  Eid edit ", cards: [{ ...slot("/1.jpg"), heading: " Lawn ", buttonLabel: " See it " }] },
    });
    expect(banners.strip.heading).toBe("Eid edit");
    expect(banners.strip.cards[0].heading).toBe("Lawn");
    expect(banners.strip.cards[0].buttonLabel).toBe("See it");
  });

  it("shows a section unless it was switched off", () => {
    expect(normaliseHomeBanners({}).strip.show).toBe(true);
    expect(normaliseHomeBanners({ strip: { show: false } }).strip.show).toBe(false);
    expect(normaliseHomeBanners({ split: { show: false } }).split.show).toBe(false);
  });

  it("turns a link it cannot follow into a link to the shop", () => {
    const banners = normaliseHomeBanners({
      strip: {
        cards: [
          slot("/1.jpg", { kind: "collection", slug: "not-a-collection" } as never),
          slot("/2.jpg", { kind: "product", id: "" }),
          slot("/3.jpg", { kind: "somewhere" } as never),
        ],
      },
    });
    expect(banners.strip.cards.map((c) => c.link)).toEqual([
      { kind: "shop" },
      { kind: "shop" },
      { kind: "shop" },
    ]);
  });

  it("keeps a link to a real collection or a product", () => {
    const banners = normaliseHomeBanners({
      split: {
        panels: [
          slot("/a.jpg", { kind: "collection", slug: "ghar" }),
          slot("/b.jpg", { kind: "product", id: "p1" }),
        ],
      },
    });
    expect(banners.split.panels.map((p) => p.link)).toEqual([
      { kind: "collection", slug: "ghar" },
      { kind: "product", id: "p1" },
    ]);
  });
});

describe("bannerHref", () => {
  const slugs = new Map([["p1", "dhoop-kurta"]]);

  it("sends a collection link to that collection in the shop", () => {
    expect(bannerHref({ kind: "collection", slug: "azad" }, slugs)).toBe("/shop?collection=azad");
  });

  it("sends a product link to the piece at its current address", () => {
    expect(bannerHref({ kind: "product", id: "p1" }, slugs)).toBe("/product/dhoop-kurta");
  });

  it("sends a link to a piece that is gone or hidden to the shop instead", () => {
    expect(bannerHref({ kind: "product", id: "deleted" }, slugs)).toBe("/shop");
  });

  it("sends a plain link to the shop", () => {
    expect(bannerHref({ kind: "shop" }, slugs)).toBe("/shop");
  });
});

describe("linkedProductIds", () => {
  it("collects each product a banner points at, once", () => {
    const banners = normaliseHomeBanners({
      strip: { cards: [slot("/1.jpg", { kind: "product", id: "p1" }), slot("/2.jpg", { kind: "product", id: "p1" })] },
      split: { panels: [slot("/a.jpg", { kind: "product", id: "p2" }), slot("/b.jpg")] },
    });
    expect(linkedProductIds(banners).sort()).toEqual(["p1", "p2"]);
  });
});

describe("resolveHomeBanners", () => {
  const none = new Map<string, string>();

  it("shows nothing until there are photos", () => {
    expect(resolveHomeBanners(emptyHomeBanners(), none)).toEqual({ strip: null, split: null });
  });

  it("holds a section back until every one of its photos is in", () => {
    const banners = normaliseHomeBanners({
      strip: { cards: [slot("/1.jpg"), slot("/2.jpg")] },
      split: { panels: [slot("/a.jpg")] },
    });
    expect(resolveHomeBanners(banners, none)).toEqual({ strip: null, split: null });
  });

  it("shows a complete section with each link worked out", () => {
    const banners = normaliseHomeBanners({
      strip: {
        cards: [slot("/1.jpg", { kind: "collection", slug: "rozana" }), slot("/2.jpg"), slot("/3.jpg")],
      },
      split: { panels: [slot("/a.jpg"), slot("/b.jpg")] },
    });
    const shown = resolveHomeBanners(banners, none);
    expect(shown.strip?.heading).toBe(DEFAULT_STRIP_HEADING);
    expect(shown.strip?.cards.map((c) => c.href)).toEqual(["/shop?collection=rozana", "/shop", "/shop"]);
    expect(shown.split?.panels).toHaveLength(2);
  });

  it("leaves out a complete section that was switched off", () => {
    const banners = normaliseHomeBanners({
      strip: { show: false, cards: [slot("/1.jpg"), slot("/2.jpg"), slot("/3.jpg")] },
    });
    expect(resolveHomeBanners(banners, none).strip).toBeNull();
  });
});
