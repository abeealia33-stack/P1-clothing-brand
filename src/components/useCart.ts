"use client";

import { useSyncExternalStore } from "react";
import * as store from "@/lib/cart-store";

export type { CartLine } from "@/lib/cart-store";

export function useCart() {
  const lines = useSyncExternalStore(
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
    lines,
    /** False until the saved cart has been read, so counts do not flash in. */
    ready,
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
    add: store.add,
    setQty: store.setQty,
    remove: store.remove,
    clear: store.clear,
  };
}
