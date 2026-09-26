import { describe, expect, it } from "vitest";
import {
  collections,
  navCollections,
  resolveCollection,
  resolveCollections,
} from "./types";

/**
 * The four slugs are fixed and every product is filed under one of them, so
 * what the owner edits is only the wording on top and whether each one is
 * listed. These check that an edit never loses a collection or leaves one
 * reading blank.
 */

describe("resolveCollections", () => {
  it("leaves every collection as written in the code when nothing is edited", () => {
    expect(resolveCollections({})).toEqual(
      collections.map((c) => ({
        ...c,
        inNav: true,
        image: `/cloth/collection-${c.slug}.svg`,
        banner: "",
      }))
    );
  });

  it("uses the owner's tile photo and banner once uploaded", () => {
    const [first] = resolveCollections({ rozana: { image: "/t.jpg", banner: "/b.jpg" } });
    expect(first.image).toBe("/t.jpg");
    expect(first.banner).toBe("/b.jpg");
  });

  it("applies the owner's wording", () => {
    const [first] = resolveCollections({
      rozana: { name: "Everyday", urdu: "روز" },
    });
    expect(first.name).toBe("Everyday");
    expect(first.urdu).toBe("روز");
    // Untouched fields keep their built-in wording rather than emptying out.
    expect(first.line).toBe(collections[0].line);
  });

  it("falls back to the built-in wording when a field is cleared", () => {
    const [first] = resolveCollections({ rozana: { name: "   ", line: "" } });
    expect(first.name).toBe(collections[0].name);
    expect(first.line).toBe(collections[0].line);
  });

  it("keeps all four whatever is hidden, so nothing can be lost by editing", () => {
    const resolved = resolveCollections({
      ghar: { inNav: false },
      azad: { inNav: false },
    });
    expect(resolved).toHaveLength(collections.length);
    expect(resolved.map((c) => c.slug)).toEqual(collections.map((c) => c.slug));
  });

  it("shows a collection unless it is explicitly hidden", () => {
    expect(resolveCollections({ rozana: { name: "Everyday" } })[0].inNav).toBe(true);
    expect(resolveCollections({ rozana: { inNav: true } })[0].inNav).toBe(true);
    expect(resolveCollections({ rozana: { inNav: false } })[0].inNav).toBe(false);
  });
});

describe("navCollections", () => {
  it("lists only what the owner is showing", () => {
    const shown = navCollections({ ghar: { inNav: false }, azad: { inNav: false } });
    expect(shown.map((c) => c.slug)).toEqual(["rozana", "bundles"]);
  });

  it("keeps the one being viewed, in brand order rather than tacked on the end", () => {
    const shown = navCollections({ ghar: { inNav: false }, azad: { inNav: false } }, "ghar");
    expect(shown.map((c) => c.slug)).toEqual(["rozana", "ghar", "bundles"]);
  });

  it("ignores an include that is already showing, or is not a collection", () => {
    expect(navCollections({}, "rozana")).toHaveLength(collections.length);
    expect(navCollections({ ghar: { inNav: false } }, "party").map((c) => c.slug)).toEqual([
      "rozana",
      "azad",
      "bundles",
    ]);
  });

  it("can be empty when everything is hidden", () => {
    const edits = Object.fromEntries(
      collections.map((c) => [c.slug, { inNav: false }])
    );
    expect(navCollections(edits)).toEqual([]);
  });
});

describe("resolveCollection", () => {
  it("finds a hidden collection, because its own page still works", () => {
    const ghar = resolveCollection("ghar", { ghar: { inNav: false, name: "Home" } });
    expect(ghar?.name).toBe("Home");
    expect(ghar?.inNav).toBe(false);
  });

  it("returns nothing for a slug that is not one of the four", () => {
    expect(resolveCollection("party", {})).toBeUndefined();
  });
});

