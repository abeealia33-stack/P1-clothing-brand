"use client";

import { useSyncExternalStore } from "react";
import * as store from "@/lib/wishlist-store";

export type { WishlistItem } from "@/lib/wishlist-store";

export function useWishlist() {
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  const ready = useSyncExternalStore(
    store.subscribe,
    store.getHydrated,
    store.getServerHydrated
  );

  return {
    items,
    /** False until the saved list has been read, so counts do not flash in. */
    ready,
    count: items.length,
    /** Only meaningful once `ready`; before that everything reads as unsaved. */
    has: (slug: string) => items.some((item) => item.slug === slug),
    toggle: store.toggle,
    remove: store.remove,
    clear: store.clear,
  };
}
