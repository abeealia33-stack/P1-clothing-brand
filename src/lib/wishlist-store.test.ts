import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The saved list lives in the shopper's own browser, so what it reads back is
 * a file anyone could have edited, an older version of this site could have
 * written, or a private window could refuse entirely. None of that may break
 * a page.
 */

/** Just enough localStorage for the store to run against, in memory. */
function fakeStorage() {
  const entries = new Map<string, string>();
  return {
    getItem: (k: string) => entries.get(k) ?? null,
    setItem: (k: string, v: string) => void entries.set(k, v),
    removeItem: (k: string) => void entries.delete(k),
  };
}

type Store = typeof import("./wishlist-store");
let store: Store;

beforeEach(async () => {
  (globalThis as { window?: unknown }).window = { localStorage: fakeStorage() };
  // A fresh copy each time: the store keeps its list in module scope, so
  // without this every test would inherit the last one’s saved pieces.
  vi.resetModules();
  store = await import("./wishlist-store");
  store.subscribe(() => {});
});

const piece = (slug: string) => ({
  slug,
  name: "Suti kurta",
  price: 2400,
  photo: "/cloth/suti.svg",
});

describe("toggle", () => {
  it("saves a piece, and says it saved it", () => {
    expect(store.toggle(piece("suti-kurta"))).toBe(true);
    expect(store.has("suti-kurta")).toBe(true);
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it("takes it off again when it is already saved", () => {
    store.toggle(piece("suti-kurta"));
    expect(store.toggle(piece("suti-kurta"))).toBe(false);
    expect(store.has("suti-kurta")).toBe(false);
  });

  it("puts the newest at the top", () => {
    store.toggle(piece("first"));
    store.toggle(piece("second"));
    expect(store.getSnapshot().map((i) => i.slug)).toEqual(["second", "first"]);
  });

  it("drops the oldest once the list is full", () => {
    for (let i = 0; i < store.MAX_SAVED + 5; i++) store.toggle(piece(`piece-${i}`));
    const saved = store.getSnapshot();
    expect(saved).toHaveLength(store.MAX_SAVED);
    expect(saved.some((i) => i.slug === "piece-0")).toBe(false);
  });
});

describe("remove and clear", () => {
  it("removes one and leaves the rest", () => {
    store.toggle(piece("a"));
    store.toggle(piece("b"));
    store.remove("a");
    expect(store.getSnapshot().map((i) => i.slug)).toEqual(["b"]);
  });

  it("empties the list", () => {
    store.toggle(piece("a"));
    store.clear();
    expect(store.getSnapshot()).toEqual([]);
  });
});

describe("normalise", () => {
  it("treats anything that is not a list as an empty one", () => {
    expect(store.normalise(null)).toEqual([]);
    expect(store.normalise({ slug: "a" })).toEqual([]);
  });

  it("drops entries with no piece to point at, and any repeat", () => {
    const read = store.normalise([
      { slug: "a", savedAt: 2 },
      { slug: "a", savedAt: 1 },
      { slug: "   " },
      { name: "no slug" },
      null,
    ]);
    expect(read.map((i) => i.slug)).toEqual(["a"]);
  });

  it("fills in what a half-written entry is missing", () => {
    const [item] = store.normalise([{ slug: "a" }]);
    expect(item).toEqual({ slug: "a", name: "", price: 0, photo: "", savedAt: 0 });
  });

  it("puts the newest first however they were stored", () => {
    const read = store.normalise([
      { slug: "older", savedAt: 1 },
      { slug: "newer", savedAt: 9 },
    ]);
    expect(read.map((i) => i.slug)).toEqual(["newer", "older"]);
  });
});

describe("a browser that will not store anything", () => {
  it("keeps working for the rest of the visit", async () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: () => {
          throw new Error("denied");
        },
        setItem: () => {
          throw new Error("denied");
        },
      },
    };
    vi.resetModules();
    const blocked: Store = await import("./wishlist-store");
    blocked.subscribe(() => {});

    expect(() => blocked.toggle(piece("a"))).not.toThrow();
    expect(blocked.has("a")).toBe(true);
  });
});
