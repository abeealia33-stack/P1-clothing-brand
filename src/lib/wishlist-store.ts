/**
 * Saved pieces, kept in localStorage and read through useSyncExternalStore —
 * the same shape as cart-store.ts, for the same reason: a server snapshot
 * (empty) renders on the server and during hydration, then the real contents
 * arrive on the first subscription, so server and client markup match without
 * an effect or a mounted flag.
 *
 * There are no customer accounts, so this is a note the browser keeps. It
 * does not follow anyone to another phone, and it is never seen by the shop.
 * That is the same bargain the cart already makes.
 */
export type WishlistItem = {
  /** The piece's address, which is also what makes it unique in here. */
  slug: string;
  name: string;
  price: number;
  photo: string;
  /** Newest first, so the list reads as a history of what caught the eye. */
  savedAt: number;
};

const KEY = "bilques.wishlist.v1";

/**
 * Enough to be a shortlist, not a second catalogue. Past this the oldest is
 * dropped, because a list nobody can reach the end of is not a list.
 */
export const MAX_SAVED = 60;

/** One shared instance: the server snapshot must be referentially stable
    across renders or useSyncExternalStore will loop. */
const EMPTY: WishlistItem[] = [];

let items: WishlistItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  loaded = true;
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) items = normalise(JSON.parse(saved));
  } catch {
    // Private mode or a corrupt entry just means starting empty.
  }
}

/**
 * Whatever was in storage, as a list this code can rely on.
 *
 * It is a file on someone's own machine: another tab from an older version,
 * or a half-written entry, must not be able to break every page that reads it.
 */
export function normalise(value: unknown): WishlistItem[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const clean: WishlistItem[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Partial<WishlistItem>;
    const slug = typeof item.slug === "string" ? item.slug.trim() : "";
    if (!slug || seen.has(slug)) continue;

    seen.add(slug);
    clean.push({
      slug,
      name: typeof item.name === "string" ? item.name : "",
      price: typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0,
      photo: typeof item.photo === "string" ? item.photo : "",
      savedAt: typeof item.savedAt === "number" && Number.isFinite(item.savedAt) ? item.savedAt : 0,
    });
  }

  return clean.sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_SAVED);
}

function commit(next: WishlistItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Out of quota — the list still works for the rest of this visit.
  }
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  if (!loaded) load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable between mutations, which is what useSyncExternalStore requires. */
export const getSnapshot = () => items;
export const getServerSnapshot = () => EMPTY;

/** False on the server and during hydration, true once the store is live. */
export const getHydrated = () => true;
export const getServerHydrated = () => false;

export const has = (slug: string) => items.some((item) => item.slug === slug);

/**
 * Saves a piece, or takes it off the list if it is already on it.
 *
 * One button does both, because that is what a heart means everywhere else:
 * tapping a filled one is how you change your mind.
 */
export function toggle(item: Omit<WishlistItem, "savedAt">) {
  if (has(item.slug)) {
    commit(items.filter((saved) => saved.slug !== item.slug));
    return false;
  }
  commit([{ ...item, savedAt: Date.now() }, ...items].slice(0, MAX_SAVED));
  return true;
}

export function remove(slug: string) {
  commit(items.filter((item) => item.slug !== slug));
}

export function clear() {
  commit([]);
}
