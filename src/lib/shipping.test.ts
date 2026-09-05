import { describe, expect, it } from "vitest";
import { SHIPPING_FLAT, shippingFor } from "./shipping";
import { site } from "./site";

describe("shippingFor", () => {
  it("charges the flat fee below the threshold", () => {
    expect(shippingFor(site.freeShippingOver - 1)).toBe(SHIPPING_FLAT);
  });

  it("ships free exactly at the threshold", () => {
    expect(shippingFor(site.freeShippingOver)).toBe(0);
  });

  it("ships free above the threshold", () => {
    expect(shippingFor(site.freeShippingOver + 5000)).toBe(0);
  });

  it("charges the flat fee on an empty basket rather than shipping it free", () => {
    expect(shippingFor(0)).toBe(SHIPPING_FLAT);
  });
});
