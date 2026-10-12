import { describe, expect, it } from "vitest";
import { DEFAULT_HERO_BUTTON, HERO_IMAGE_SIZES, MAX_HERO_SLIDES, emptyHero, heroImageUrl, normaliseHero } from "./hero";

describe("heroImageUrl", () => {
  const stored = "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_2000/v123/bilques/banner.jpg?test=1";

  it("keeps the requested artwork dimensions", () => {
    expect(HERO_IMAGE_SIZES.desktop).toEqual({ width: 3840, height: 2160 });
    expect(HERO_IMAGE_SIZES.mobile).toEqual({ width: 2000, height: 4096 });
  });

  it("updates existing managed hero URLs without changing the original or query", () => {
    expect(heroImageUrl(stored, "desktop")).toBe(stored.replace("w_2000", "w_3840"));
    expect(heroImageUrl(stored, "mobile")).toBe(stored);
    expect(heroImageUrl(heroImageUrl(stored, "desktop"), "desktop")).toBe(
      heroImageUrl(stored, "desktop")
    );
  });

  it("upgrades URLs saved with the earlier desktop and mobile limits", () => {
    expect(heroImageUrl(stored.replace("w_2000", "w_2880"), "desktop")).toBe(
      stored.replace("w_2000", "w_3840")
    );
    expect(heroImageUrl(stored.replace("w_2000", "w_1504"), "mobile")).toBe(stored);
  });

  it("leaves local, external and custom or signed Cloudinary URLs unchanged", () => {
    for (const source of [
      "", "/cloth/hero.svg", "data:image/png;base64,AA==",
      stored.replace("res.cloudinary.com", "example.com"),
      stored.replace("f_auto,q_auto,c_limit,w_2000/", ""),
      stored.replace("f_auto,q_auto,c_limit,w_2000", "c_fill,w_1000,h_500"),
      stored.replace("/upload/", "/upload/s--signature--/"),
      stored.replace("/image/", "/video/"),
    ]) expect(heroImageUrl(source, "desktop")).toBe(source);
  });
});

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
