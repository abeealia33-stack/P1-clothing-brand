import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MetaPurchase } from "./meta-purchase";

const purchase: MetaPurchase = {
  orderId: "BQ-2610-1234",
  value: 5000,
  contents: [{ id: "suti-kurta", quantity: 2, item_price: 2400 }],
};

let entries: Map<string, string>;
let fbq: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetModules();
  entries = new Map();
  fbq = vi.fn();
  vi.stubGlobal("window", {
    fbq,
    localStorage: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("Meta purchase tracking", () => {
  it("sends the full rupee total, line items and a stable event ID", async () => {
    const { trackMetaPurchase } = await import("./meta-purchase");
    trackMetaPurchase("1056053744116056", purchase);
    expect(fbq).toHaveBeenCalledExactlyOnceWith(
      "trackSingle",
      "1056053744116056",
      "Purchase",
      {
        value: 5000,
        currency: "PKR",
        content_type: "product",
        content_ids: ["suti-kurta"],
        contents: purchase.contents,
        num_items: 2,
      },
      { eventID: "purchase-BQ-2610-1234" },
    );
  });

  it("does not count remounts or a page reload as another purchase", async () => {
    let tracker = await import("./meta-purchase");
    tracker.trackMetaPurchase("123", purchase);
    tracker.trackMetaPurchase("123", purchase);
    vi.resetModules();
    tracker = await import("./meta-purchase");
    tracker.trackMetaPurchase("123", purchase);
    expect(fbq).toHaveBeenCalledTimes(1);
    tracker.trackMetaPurchase("123", { ...purchase, orderId: "BQ-2610-5678" });
    expect(fbq).toHaveBeenCalledTimes(2);
  });

  it("can retry once the pixel queue becomes ready", async () => {
    const { trackMetaPurchase } = await import("./meta-purchase");
    window.fbq = undefined;
    trackMetaPurchase("123", purchase);
    expect(entries.size).toBe(0);
    window.fbq = fbq;
    trackMetaPurchase("123", purchase);
    expect(fbq).toHaveBeenCalledTimes(1);
  });

  it("preserves confirmation and guards effect replays when storage is blocked", async () => {
    Object.defineProperty(window, "localStorage", {
      get: () => { throw new Error("Storage blocked"); },
    });
    const { trackMetaPurchase } = await import("./meta-purchase");
    expect(() => trackMetaPurchase("123", purchase)).not.toThrow();
    trackMetaPurchase("123", purchase);
    expect(fbq).toHaveBeenCalledTimes(1);
  });

  it("does not let a pixel error break confirmation or mark an unsent event", async () => {
    fbq.mockImplementationOnce(() => { throw new Error("Pixel failure"); });
    const { trackMetaPurchase } = await import("./meta-purchase");
    expect(() => trackMetaPurchase("123", purchase)).not.toThrow();
    expect(entries.size).toBe(0);
    trackMetaPurchase("123", purchase);
    expect(fbq).toHaveBeenCalledTimes(2);
    expect(entries.size).toBe(1);
  });
});
