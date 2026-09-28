import { describe, expect, it } from "vitest";
import { DEFAULT_HERO_BUTTON, MAX_HERO_SLIDES, emptyHero, normaliseHero } from "./hero";

describe("normaliseHero", () => {
  it("reads nothing stored as an empty hero", () => {
    expect(normaliseHero(undefined)).toEqual(emptyHero());
    expect(normaliseHero("hero")).toEqual(emptyHero());
  });

  it("reads the oldest list of images back as one slide each", () => {
    expect(normaliseHero(["", "/a.jpg", "/b.jpg"]).slides).toEqual([
      { desktopImage: "/a.jpg", mobileImage: "" },
      { desktopImage: "/b.jpg", mobileImage: "" },
    ]);
    expect(normaliseHero([])).toEqual(emptyHero());
  });

  it("reads the single pair that replaced it as the one slide it describes", () => {
    expect(normaliseHero({ desktopImage: "/d.jpg", mobileImage: "/m.jpg" }).slides).toEqual([
      { desktopImage: "/d.jpg", mobileImage: "/m.jpg" },
    ]);
  });

  it("drops a slide with no photograph to show", () => {
    const hero = normaliseHero({
      slides: [{ desktopImage: "" }, { desktopImage: "/a.jpg" }, { mobileImage: "/m.jpg" }],
    });
    expect(hero.slides).toEqual([{ desktopImage: "/a.jpg", mobileImage: "" }]);
  });

  it("will not take more slides than the hero shows", () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ desktopImage: `/${i}.jpg` }));
    expect(normaliseHero({ slides: many }).slides).toHaveLength(MAX_HERO_SLIDES);
  });

  it("keeps the owner's settings", () => {
    const hero = {
      slides: [{ desktopImage: "/d.jpg", mobileImage: "/m.jpg" }],
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
