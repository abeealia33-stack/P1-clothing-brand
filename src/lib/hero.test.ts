import { describe, expect, it } from "vitest";
import { DEFAULT_HERO_BUTTON, emptyHero, normaliseHero } from "./hero";

describe("normaliseHero", () => {
  it("reads nothing stored as an empty hero", () => {
    expect(normaliseHero(undefined)).toEqual(emptyHero());
    expect(normaliseHero("hero")).toEqual(emptyHero());
  });

  it("keeps the first photo of the old slideshow list as the desktop photo", () => {
    expect(normaliseHero(["", "/a.jpg", "/b.jpg"])).toEqual({
      ...emptyHero(),
      desktopImage: "/a.jpg",
    });
    expect(normaliseHero([])).toEqual(emptyHero());
  });

  it("keeps the owner's settings", () => {
    const hero = {
      desktopImage: "/d.jpg",
      mobileImage: "/m.jpg",
      buttonLabel: "Eid edit",
      link: { kind: "collection", slug: "azad" },
      position: "left",
      focus: "top",
    };
    expect(normaliseHero(hero)).toEqual(hero);
  });

  it("puts the button text back when cleared, and caps it at 20 characters", () => {
    expect(normaliseHero({ buttonLabel: "  " }).buttonLabel).toBe(DEFAULT_HERO_BUTTON);
    expect(normaliseHero({ buttonLabel: "a".repeat(30) }).buttonLabel).toHaveLength(20);
  });

  it("falls back to the defaults for a position, focus or link it does not know", () => {
    const hero = normaliseHero({ position: "right", focus: "middle", link: { kind: "x" } });
    expect(hero.position).toBe("center");
    expect(hero.focus).toBe("center");
    expect(hero.link).toEqual({ kind: "shop" });
  });
});
