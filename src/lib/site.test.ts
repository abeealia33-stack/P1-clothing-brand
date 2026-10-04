import { describe, expect, it } from "vitest";
import { showsFloatingWhatsApp } from "./site";

describe("showsFloatingWhatsApp", () => {
  it("floats over the pages people browse", () => {
    for (const path of ["/", "/shop", "/about", "/contact", "/cart", "/track", "/shipping", "/wishlist"]) {
      expect(showsFloatingWhatsApp(path)).toBe(true);
    }
  });

  it("stays off checkout, where a second way to buy only distracts", () => {
    expect(showsFloatingWhatsApp("/checkout")).toBe(false);
    expect(showsFloatingWhatsApp("/checkout/confirmed")).toBe(false);
  });

  it("stays off product pages at every width, where it lands on Save", () => {
    expect(showsFloatingWhatsApp("/product/kurta")).toBe(false);
  });
});
