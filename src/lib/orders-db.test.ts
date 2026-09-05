import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Placing an order takes the stock with it. These run against a throwaway copy
 * of the development database, so they exercise the real SQL — the guard that
 * stops two people buying the same last piece lives in a WHERE clause, and a
 * mock would not test it.
 */

const workDir = mkdtempSync(path.join(tmpdir(), "bilques-test-"));
const dbFile = path.join(workDir, "test.db");

type OrdersModule = typeof import("./orders-db");
type PrismaModule = typeof import("./prisma");

let orders: OrdersModule;
let prisma: PrismaModule["prisma"];
let product: { id: string; slug: string; name: string; price: number };

beforeAll(async () => {
  copyFileSync(path.resolve(import.meta.dirname, "../../dev.db"), dbFile);
  // Read by prisma.ts at import time, so it must be set before that import.
  process.env.DATABASE_URL = `file:${dbFile}`;

  prisma = (await import("./prisma")).prisma;
  orders = await import("./orders-db");
  product = await prisma.product.findFirstOrThrow({
    select: { id: true, slug: true, name: true, price: true },
  });
});

afterAll(async () => {
  await prisma?.$disconnect();
  rmSync(workDir, { recursive: true, force: true });
});

/** A one-line order for the piece under test. */
function draft(qty: number) {
  return {
    name: "Test Buyer",
    phone: "03001112233",
    address: "1 Test Street",
    city: "Karachi",
    payment: "cod" as const,
    lines: [
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        size: "M",
        color: "Test",
        photo: "",
        qty,
      },
    ],
    subtotal: product.price * qty,
    shipping: 0,
    total: product.price * qty,
  };
}

const setStock = (stock: number) =>
  prisma.product.update({ where: { id: product.id }, data: { stock } });

const currentStock = async () =>
  (await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock;

describe("createOrder", () => {
  it("takes the ordered quantity off the shelf", async () => {
    await setStock(5);
    await orders.createOrder(draft(2));
    expect(await currentStock()).toBe(3);
  });

  it("refuses an order larger than the stock, and leaves the stock alone", async () => {
    await setStock(1);
    await expect(orders.createOrder(draft(3))).rejects.toBeInstanceOf(
      orders.OutOfStockError
    );
    expect(await currentStock()).toBe(1);
  });

  it("lets only one of two simultaneous orders take the last piece", async () => {
    await setStock(1);

    const results = await Promise.allSettled([
      orders.createOrder(draft(1)),
      orders.createOrder(draft(1)),
    ]);

    const placed = results.filter((r) => r.status === "fulfilled");
    const refused = results.filter(
      (r) => r.status === "rejected" && r.reason instanceof orders.OutOfStockError
    );

    expect(placed).toHaveLength(1);
    expect(refused).toHaveLength(1);
    expect(await currentStock()).toBe(0);
  });

  it("never drives stock below zero", async () => {
    await setStock(2);
    await Promise.allSettled([
      orders.createOrder(draft(2)),
      orders.createOrder(draft(2)),
      orders.createOrder(draft(1)),
    ]);
    expect(await currentStock()).toBeGreaterThanOrEqual(0);
  });

  it("names the piece that sold out so the customer can be told which", async () => {
    await setStock(0);
    await expect(orders.createOrder(draft(1))).rejects.toMatchObject({
      productName: product.name,
    });
  });
});
