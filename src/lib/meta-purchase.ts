export type MetaPurchase = {
  orderId: string;
  value: number;
  contents: { id: string; quantity: number; item_price: number }[];
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const queued = new Set<string>();

/** Called only with a server-verified, newly placed order after pixel init. */
export function trackMetaPurchase(pixelId: string, purchase: MetaPurchase) {
  if (typeof window === "undefined" || !window.fbq) return;
  const key = `bilques.meta-purchase.${pixelId}.${purchase.orderId}`;
  if (queued.has(key)) return;
  try {
    if (window.localStorage.getItem(key)) return;
  } catch {
    // Some browsers refuse storage. The in-memory guard still covers replays.
  }

  try {
    window.fbq(
      "trackSingle",
      pixelId,
      "Purchase",
      {
        value: purchase.value,
        currency: "PKR",
        content_type: "product",
        content_ids: purchase.contents.map((line) => line.id),
        contents: purchase.contents,
        num_items: purchase.contents.reduce((sum, line) => sum + line.quantity, 0),
      },
      { eventID: `purchase-${purchase.orderId}` },
    );
  } catch {
    // A tracking failure must not interrupt the order confirmation.
    return;
  }

  queued.add(key);
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // The event is already queued; do not send it again in this document.
  }
}
