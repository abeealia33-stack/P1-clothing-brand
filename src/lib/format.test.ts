import { describe, expect, it } from "vitest";
import { ago, photoAlt } from "./format";

describe("ago", () => {
  const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

  it("says just now rather than nought minutes", () => {
    expect(ago(minutesAgo(0))).toBe("just now");
  });

  it("counts in minutes, then hours, then days", () => {
    expect(ago(minutesAgo(5))).toBe("5 min ago");
    expect(ago(minutesAgo(60))).toBe("1 hour ago");
    expect(ago(minutesAgo(60 * 26))).toBe("1 day ago");
  });

  it("gives a date once a week has passed, rather than counting on", () => {
    expect(ago(minutesAgo(60 * 24 * 30))).toMatch(/\d/);
    expect(ago(minutesAgo(60 * 24 * 30))).not.toContain("ago");
  });
});

describe("photoAlt", () => {
  const piece = { name: "Suti kurta", colors: [{ name: "Undyed", hex: "#eee" }] };

  it("names the colour it is photographed in", () => {
    expect(photoAlt(piece)).toBe("Suti kurta in Undyed");
  });

  it("falls back to the name alone when a piece has no colours to read", () => {
    expect(photoAlt({ ...piece, colors: [] })).toBe("Suti kurta");
  });
});
