import { describe, expect, it } from "vitest";
import { MAX_PER_LINE, orderableQty } from "./stock";

describe("orderableQty", () => {
  it("passes an ordinary quantity through", () => {
    expect(orderableQty(3, 10)).toBe(3);
  });

  it("never exceeds what is in stock", () => {
    expect(orderableQty(5, 2)).toBe(2);
  });

  it("returns nothing when the piece has sold out", () => {
    expect(orderableQty(1, 0)).toBe(0);
  });

  it("holds the per-line ceiling even when stock is deep", () => {
    expect(orderableQty(50, 500)).toBe(MAX_PER_LINE);
  });

  it("treats a tampered or missing quantity as one", () => {
    expect(orderableQty("abc", 10)).toBe(1);
    expect(orderableQty(0, 10)).toBe(1);
    expect(orderableQty(-4, 10)).toBe(1);
    expect(orderableQty(undefined, 10)).toBe(1);
  });

  it("rounds a fractional quantity down", () => {
    expect(orderableQty(2.9, 10)).toBe(2);
  });

  it("never returns a negative, even for negative stock", () => {
    expect(orderableQty(2, -5)).toBe(0);
  });
});
