import { describe, expect, it, vi } from "vitest";

/**
 * The cart lives in the shopper's own browser, so what it reads back is a
 * file anyone could have edited, an older version of this site could have
 * written, or a private window could refuse entirely. None of that may break
 * a page — and the cart count sits in the header of every page there is.
 */

/** Just enough localStorage for the store to run against, in memory. */
function fakeStorage(seed?: string) {
  const entries = new Map<string, string>();
  if (seed !== undefined) entries.set("bilques.cart.v1", seed);
  return {
    getItem: (k: string) => entries.get(k) ?? null,
    setItem: (k: string, v: string) => void entries.set(k, v),
    removeItem: (k: string) => void entries.delete(k),
  };
}

type Store = typeof import("./cart-store");

/** A fresh copy each time: the store keeps its lines in module scope. */
async function load(seed?: string): Promise<Store> {
  (globalThis as { window?: unknown }).window = { localStorage: fakeStorage(seed) };
  vi.resetModules();
  const store: Store = await import("./cart-store");
  store.subscribe(() => {});
  return store;
}

const line = (size = "M") => ({
  slug: "suti-kurta",
  name: "Suti kurta",
  price: 2400,
  size,
  color: "Undyed",
  photo: "/cloth/suti.svg",
  qty: 1,
});

describe("reading what is already in storage", () => {
  it("keeps a cart written by this version", async () => {
    const store = await load();
    store.add(line());
    const saved = window.localStorage.getItem("bilques.cart.v1")!;

    const reopened = await load(saved);
    expect(reopened.getSnapshot()).toHaveLength(1);
    expect(reopened.getSnapshot()[0].name).toBe("Suti kurta");
  });

  it("starts empty rather than throwing when the entry is not a list", async () => {
    for (const nonsense of ['"a string"', "null", "42", '{"qty":2}', "[[["]) {
      const store = await load(nonsense);
      expect(store.getSnapshot()).toEqual([]);
    }
  });

  it("drops a line with nothing to show and keeps the rest", async () => {
    const store = await load(
      JSON.stringify([{ ...line(), id: "suti-kurta__M__Undyed" }, null, { qty: 2 }, "nope"])
    );
    expect(store.getSnapshot()).toHaveLength(1);
  });

  it("gives every line the numbers a total can be added up from", async () => {
    const store = await load(
      JSON.stringify([{ slug: "x", name: "X", size: "M", color: "Red", qty: "many" }])
    );
    const [only] = store.getSnapshot();
    expect(only.qty).toBe(1);
    expect(only.price).toBe(0);
    expect(only.photo).toBe("");
    expect(Number.isFinite(only.qty * only.price)).toBe(true);
  });

  it("gives a line an id when the saved one has none, so it can still be removed", async () => {
    const store = await load(JSON.stringify([line()]));
    const [only] = store.getSnapshot();
    expect(only.id).toBeTruthy();

    store.remove(only.id);
    expect(store.getSnapshot()).toEqual([]);
  });
});

describe("adding and changing", () => {
  it("adds a piece, and adds to the same line when it is the same size and colour", async () => {
    const store = await load();
    store.add(line());
    store.add(line());
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0].qty).toBe(2);
  });

  it("keeps the same piece in two sizes as two lines", async () => {
    const store = await load();
    store.add(line("M"));
    store.add(line("L"));
    expect(store.getSnapshot()).toHaveLength(2);
  });

  it("will not stack a line past ten", async () => {
    const store = await load();
    for (let i = 0; i < 15; i++) store.add(line());
    expect(store.getSnapshot()[0].qty).toBe(10);
  });

  it("takes a line out when its quantity reaches nought", async () => {
    const store = await load();
    store.add(line());
    store.setQty(store.getSnapshot()[0].id, 0);
    expect(store.getSnapshot()).toEqual([]);
  });
});
