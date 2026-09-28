import { describe, expect, it } from "vitest";
import {
  SHIPPING_FLAT,
  deliveryWindow,
  deliveryWindowLabel,
  isFastCity,
  shippingFor,
} from "./shipping";
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

describe("deliveryWindow", () => {
  const placed = new Date("2026-09-30T10:00:00");

  it("gives the four big cities the faster window", () => {
    expect(isFastCity("Lahore")).toBe(true);
    expect(isFastCity("  karachi ")).toBe(true);
    expect(isFastCity("DHA Phase 5, Lahore")).toBe(true);
    expect(isFastCity("Multan")).toBe(false);
  });

  it("counts whole days from when the order was placed", () => {
    const { from, to } = deliveryWindow("Lahore", placed);
    expect(from.getDate()).toBe(2);
    expect(to.getDate()).toBe(4);
  });

  it("gives everywhere else the longer window", () => {
    const { from, to } = deliveryWindow("Multan", placed);
    expect(from.getDate()).toBe(4);
    expect(to.getDate()).toBe(7);
  });

  it("names the month once when both dates share it", () => {
    expect(deliveryWindowLabel("Multan", placed)).toBe("4 to 7 October");
  });

  it("names both months when the window crosses one", () => {
    // 28 Sep + 2 and + 4 days lands either side of the month's end.
    expect(deliveryWindowLabel("Lahore", new Date("2026-09-28T10:00:00"))).toBe(
      "30 September to 2 October"
    );
  });
});
