import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Adding a piece is the one thing the owner does most, and it writes to five
 * JSON-in-text columns plus a join table. These run against a throwaway copy
 * of the development database so the real SQL is exercised.
 */

const workDir = mkdtempSync(path.join(tmpdir(), "bilques-catalogue-"));
const dbFile = path.join(workDir, "test.db");

type CatalogueModule = typeof import("./catalogue");
type PrismaModule = typeof import("./prisma");

let catalogue: CatalogueModule;
let prisma: PrismaModule["prisma"];

beforeAll(async () => {
  copyFileSync(path.resolve(import.meta.dirname, "../../dev.db"), dbFile);
  // Read by prisma.ts at import time, so it must be set before that import.
  process.env.DATABASE_URL = `file:${dbFile}`;

  prisma = (await import("./prisma")).prisma;
  catalogue = await import("./catalogue");
});

afterAll(async () => {
  await prisma?.$disconnect();
  rmSync(workDir, { recursive: true, force: true });
});

const draft = (slug: string) => ({
  slug,
  name: "Probe piece",
  urdu: null,
  collection: "rozana" as const,
  price: 2400,
  stock: 3,
  description: "A plain cotton kurta, cut straight.",
  sizes: ["S", "M"],
  colors: [{ name: "Sage", hex: "#8B9E8B" }],
  photos: ["/uploads/probe.jpg"],
  details: ["100% cotton"],
  active: true,
  categoryIds: [] as string[],
});

describe("createProduct", () => {
  it("saves a piece and reads it back whole", async () => {
    const input = draft("probe-basic");
    const saved = await catalogue.createProduct(input);

    expect(saved.id).toBeTruthy();
    expect(saved.slug).toBe("probe-basic");

    const read = await catalogue.getProductBySlug("probe-basic");
    expect(read?.name).toBe("Probe piece");
    expect(read?.sizes).toEqual(["S", "M"]);
    expect(read?.colors).toEqual([{ name: "Sage", hex: "#8B9E8B" }]);
    expect(read?.photos).toEqual(["/uploads/probe.jpg"]);
  });

  it("files a piece under the categories it was given", async () => {
    const category = await prisma.category.create({
      data: { name: "Probe category", slug: "probe-category" },
    });

    const saved = await catalogue.createProduct({
      ...draft("probe-categorised"),
      categoryIds: [category.id],
    });

    expect(saved.categoryIds).toEqual([category.id]);
  });

  it("reports a slug as taken once it is used", async () => {
    await catalogue.createProduct(draft("probe-taken"));
    expect(await catalogue.isSlugTaken("probe-taken")).toBe(true);
    expect(await catalogue.isSlugTaken("probe-never-used")).toBe(false);
  });
});
