import { describe, expect, it } from "vitest";
import { MIN_SIZES, tooSmall } from "./image-size";

describe("tooSmall", () => {
  it("accepts a photo at or above the minimum", () => {
    expect(tooSmall({ width: 1200, height: 1600 }, MIN_SIZES.product)).toBeNull();
    expect(tooSmall({ width: 3000, height: 4000 }, MIN_SIZES.product)).toBeNull();
  });

  it("turns away a photo short in either direction, saying both sizes", () => {
    expect(tooSmall({ width: 1080, height: 1600 }, MIN_SIZES.product)).toBe(
      "This photo is 1080 × 1600 px. It needs to be at least 1200 × 1600 px."
    );
    expect(tooSmall({ width: 2400, height: 1000 }, MIN_SIZES.heroDesktop)).not.toBeNull();
  });
});
