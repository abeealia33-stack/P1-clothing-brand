import "server-only";

import { prisma } from "./prisma";
import { normaliseStatus } from "./types";
import type { Order, OrderLine, OrderStatus, PaymentMethod } from "./types";

type ItemRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  color: string;
  photo: string;
  qty: number;
};

type OrderRow = {
  id: string;
  createdAt: Date;
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  payment: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  items: ItemRow[];
};

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    notes: row.notes,
    payment: row.payment as PaymentMethod,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    // Orders placed before the stages were renamed are mapped on read.
    status: normaliseStatus(row.status),
    lines: row.items.map(
      (i): OrderLine => ({
        id: i.id,
        slug: i.slug,
        name: i.name,
        price: i.price,
        size: i.size,
        color: i.color,
        photo: i.photo,
        qty: i.qty,
      })
    ),
  };
}

/** Digits only, so 0300-1234567 and +92 300 1234567 match the same customer. */
export const normalisePhone = (phone: string) => phone.replace(/\D/g, "").slice(-10);

/**
 * Short enough to read out on the phone, and unmistakable for a price.
 * Retried on collision rather than trusted to be unique by luck.
 */
function makeId(): string {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
  return `BQ-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Raised when a piece ran out between the checkout page pricing the cart and
 * the order actually being written. Carries the name so the customer is told
 * which piece, not just that something went wrong.
 */
export class OutOfStockError extends Error {
  constructor(readonly productName: string) {
    super(`${productName} is out of stock`);
    this.name = "OutOfStockError";
  }
}

export type OrderDraft = {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  payment: PaymentMethod;
  lines: Omit<OrderLine, "id">[];
  subtotal: number;
  shipping: number;
  total: number;
};

export async function createOrder(draft: OrderDraft): Promise<Order> {
  // Resolve the slugs the cart carried into real product ids once, so each
  // item can keep a link back to the piece while still storing its snapshot.
  const known = await prisma.product.findMany({
    where: { slug: { in: draft.lines.map((l) => l.slug) } },
    select: { id: true, slug: true },
  });

  const idBySlug = new Map(known.map((p) => [p.slug, p.id]));

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = makeId();
    const clash = await prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });
    if (clash) continue;

    /* Taking the stock and writing the order are one transaction: an order
       that cannot be stocked is never written, and stock taken for an order
       that fails to write goes back. */
    const row = await prisma.$transaction(async (tx) => {
      for (const line of draft.lines) {
        const productId = idBySlug.get(line.slug);
        // A line whose product has since been deleted keeps its snapshot and
        // has no shelf left to take from.
        if (!productId) continue;

        /* The guard lives in the WHERE clause, not in a read followed by a
           write: two people checking out the last piece at the same moment
           both pass a `stock > 0` read, but only one can match `stock >= qty`
           at the moment of the update. The loser gets told. */
        const taken = await tx.product.updateMany({
          where: { id: productId, stock: { gte: line.qty } },
          data: { stock: { decrement: line.qty } },
        });
        if (taken.count === 0) throw new OutOfStockError(line.name);
      }

      return tx.order.create({
        data: {
          id,
          name: draft.name,
          phone: draft.phone,
          address: draft.address,
          city: draft.city,
          notes: draft.notes ?? null,
          payment: draft.payment,
          subtotal: draft.subtotal,
          shipping: draft.shipping,
          total: draft.total,
          items: {
            create: draft.lines.map((line) => ({
              slug: line.slug,
              name: line.name,
              price: line.price,
              size: line.size,
              color: line.color,
              photo: line.photo,
              qty: line.qty,
              // Linked when the piece still exists, so the admin can jump from an
              // order item to the product; the snapshot above is what counts, and
              // an unknown slug simply leaves the link null.
              productId: idBySlug.get(line.slug) ?? null,
            })),
          },
        },
        include: { items: true },
      });
    });
    return toOrder(row);
  }
  throw new Error("Could not allocate an order number. Please try again.");
}

/** Customer-facing lookup: by order ID, or by the phone used to order. */
export async function findOrderForCustomer(query: string): Promise<Order | null> {
  const q = query.trim();
  if (!q) return null;

  const byId = await prisma.order.findUnique({
    where: { id: q.toUpperCase() },
    include: { items: true },
  });
  if (byId) return toOrder(byId);

  const digits = normalisePhone(q);
  if (digits.length < 10) return null;

  const byPhone = await prisma.order.findFirst({
    where: { phone: { contains: digits } },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return byPhone ? toOrder(byPhone) : null;
}

/* ----------------------------------------------------------------- admin -- */

const legacyAliases: Partial<Record<OrderStatus, string[]>> = {
  in_progress: ["in_progress", "packed"],
  delivered: ["delivered", "fulfilled"],
};

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: status ? { status: { in: legacyAliases[status] ?? [status] } } : {},
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 200,
  });
  return rows.map(toOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const row = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return row ? toOrder(row) : null;
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await prisma.order.update({ where: { id }, data: { status } });
}

/** The only numbers the owner asked for: what needs doing, and today's takings. */
export async function orderSummary() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // "packed" and "fulfilled" are the old names for in progress and delivered;
  // both are still counted so orders placed before the rename are not lost.
  const [newCount, inProgressCount, shippedCount, todayCount, openOrders] =
    await Promise.all([
      prisma.order.count({ where: { status: "new" } }),
      prisma.order.count({ where: { status: { in: ["in_progress", "packed"] } } }),
      prisma.order.count({ where: { status: "shipped" } }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["new", "in_progress", "packed", "shipped"] } },
      }),
    ]);

  return {
    newCount,
    inProgressCount,
    shippedCount,
    todayCount,
    openValue: openOrders._sum.total ?? 0,
  };
}
