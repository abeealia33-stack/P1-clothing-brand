import { describe, expect, it } from "vitest";
import { MIN_SIZES, tooSmall, type MinSize } from "./image-size";

/** Mirrors IMAGE_WIDTHS in uploads.ts, which cannot be imported: it is
    server-only, and this module is read by the admin's client components. */
const SERVED_WIDTH = { product: 1200, feature: 2000 };

/** Which cap each slot's photograph is stored under. */
const PURPOSE: Record<keyof typeof MIN_SIZES, keyof typeof SERVED_WIDTH> = {
  heroDesktop: "feature",
  heroMobile: "feature",
  product: "product",
  tile: "product",
  pair: "feature",
  collectionBanner: "feature",
  groupBanner: "feature",
};

describe("tooSmall", () => {
  const min: MinSize = { width: 1000, height: 800 };

  it("accepts a photo at or above the floor", () => {
    expect(tooSmall({ width: 1000, height: 800 }, min)).toBeNull();
    expect(tooSmall({ width: 3000, height: 4000 }, min)).toBeNull();
  });

  it("turns away a photo short in either direction, saying both sizes", () => {
    expect(tooSmall({ width: 999, height: 800 }, min)).toBe(
      "This photo is 999 × 800 px. It needs to be at least 1000 × 800 px."
    );
    expect(tooSmall({ width: 1000, height: 799 }, min)).not.toBeNull();
  });
});

describe("the floors themselves", () => {
  /* The hero once asked for 2400px when the widest it is ever stored at is
     2000, so a usable photograph was refused over 400px nobody would have
     seen. A floor above the cap is always a bug. */
  it("never ask for more than the photo is stored at", () => {
    for (const [slot, min] of Object.entries(MIN_SIZES)) {
      const cap = SERVED_WIDTH[PURPOSE[slot as keyof typeof MIN_SIZES]];
      expect({ slot, width: min.width }).toEqual({
        slot,
        width: Math.min(min.width, cap),
      });
    }
  });

  it("leave room under the cap, so a photo near the mark still goes up", () => {
    for (const [slot, min] of Object.entries(MIN_SIZES)) {
      const cap = SERVED_WIDTH[PURPOSE[slot as keyof typeof MIN_SIZES]];
      expect({ slot, tight: min.width > cap * 0.9 }).toEqual({ slot, tight: false });
    }
  });
});
