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

/**
 * Who is allowed to say the money arrived. A customer can only ever claim it;
 * the owner is the one who confirms.
 */
describe("payment state", () => {
  const placeOne = async () => {
    await setStock(5);
    return orders.createOrder(draft(1));
  };

  it("starts an order unpaid, with nothing sent in", async () => {
    const order = await placeOne();
    expect(order.paymentStatus).toBe("unpaid");
    expect(order.paymentProof).toBeNull();
    expect(order.paidAt).toBeNull();
  });

  it("moves an order to review when a receipt is uploaded, not to paid", async () => {
    const order = await placeOne();
    expect(await orders.attachPaymentProof(order.id, "/uploads/receipt.jpg")).toBe(
      true
    );

    const after = await orders.getOrder(order.id);
    expect(after?.paymentStatus).toBe("review");
    expect(after?.paymentProof).toBe("/uploads/receipt.jpg");
    expect(after?.paidAt).toBeNull();
  });

  it("stamps the time when the owner confirms the payment", async () => {
    const order = await placeOne();
    await orders.setPaymentStatus(order.id, "paid");

    const after = await orders.getOrder(order.id);
    expect(after?.paymentStatus).toBe("paid");
    expect(after?.paidAt).not.toBeNull();
  });

  it("refuses a receipt uploaded after the owner has settled the order", async () => {
    const order = await placeOne();
    await orders.setPaymentStatus(order.id, "paid");

    expect(await orders.attachPaymentProof(order.id, "/uploads/late.jpg")).toBe(
      false
    );

    const after = await orders.getOrder(order.id);
    expect(after?.paymentStatus).toBe("paid");
    expect(after?.paymentProof).toBeNull();
  });

  it("clears the paid timestamp when an order is put back to unpaid", async () => {
    const order = await placeOne();
    await orders.setPaymentStatus(order.id, "paid");
    await orders.setPaymentStatus(order.id, "unpaid");

    const after = await orders.getOrder(order.id);
    expect(after?.paymentStatus).toBe("unpaid");
    expect(after?.paidAt).toBeNull();
  });
});
