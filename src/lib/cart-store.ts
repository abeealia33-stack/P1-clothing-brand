/**
 * The cart, kept in localStorage and read through useSyncExternalStore.
 *
 * localStorage is an external store, so React reads it the way it reads any
 * external store: a server snapshot (empty) renders on the server and during
 * hydration, then the real contents arrive on the first subscription. That
 * keeps server and client markup identical without an effect, a mounted flag,
 * or a flash of an empty cart.
 */
export type CartLine = {
  /** productSlug + size + colour — the same piece in two sizes is two lines. */
  id: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  color: string;
  photo: string;
  qty: number;
};

const KEY = "bilques.cart.v1";
const MAX_PER_LINE = 10;

/** One shared instance: the server snapshot must be referentially stable
    across renders or useSyncExternalStore will loop. */
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const lineId = (slug: string, size: string, color: string) =>
  `${slug}__${size}__${color}`;

function load() {
  loaded = true;
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) lines = normalise(JSON.parse(saved));
  } catch {
    // Private mode or a corrupt entry just means starting empty.
  }
}

/**
 * Whatever was in storage, as a list this code can rely on.
 *
 * It is a file on someone's own machine: another tab from an older version,
 * or a half-written entry, must not be able to break every page that reads
 * it — and the cart count is in the header of every page there is.
 */
export function normalise(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];

  const clean: CartLine[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const line = entry as Partial<CartLine>;
    const slug = typeof line.slug === "string" ? line.slug.trim() : "";
    if (!slug) continue;

    const text = (v: unknown) => (typeof v === "string" ? v : "");
    const size = text(line.size);
    const color = text(line.color);
    const qty = typeof line.qty === "number" && Number.isFinite(line.qty) ? line.qty : 1;

    clean.push({
      // An entry saved without one still has to be removable from the cart.
      id: text(line.id) || lineId(slug, size, color),
      slug,
      name: text(line.name),
      price:
        typeof line.price === "number" && Number.isFinite(line.price) ? line.price : 0,
      size,
      color,
      photo: text(line.photo),
      qty: Math.min(Math.max(Math.round(qty), 1), MAX_PER_LINE),
    });
  }

  return clean;
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Out of quota — the cart still works for the rest of this visit.
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
export const getSnapshot = () => lines;
export const getServerSnapshot = () => EMPTY;

/** False on the server and during hydration, true once the store is live. */
export const getHydrated = () => true;
export const getServerHydrated = () => false;

export function add(line: Omit<CartLine, "id">) {
  const id = lineId(line.slug, line.size, line.color);
  const found = lines.find((l) => l.id === id);
  commit(
    found
      ? lines.map((l) =>
          l.id === id ? { ...l, qty: Math.min(l.qty + line.qty, MAX_PER_LINE) } : l
        )
      : [...lines, { ...line, id }]
  );
}

export function setQty(id: string, qty: number) {
  commit(
    qty <= 0
      ? lines.filter((l) => l.id !== id)
      : lines.map((l) =>
          l.id === id ? { ...l, qty: Math.min(qty, MAX_PER_LINE) } : l
        )
  );
}

export function remove(id: string) {
  commit(lines.filter((l) => l.id !== id));
}

export function clear() {
  commit([]);
}
