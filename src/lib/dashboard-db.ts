import "server-only";

import { prisma } from "./prisma";
import { normalisePhone } from "./orders-db";

/** Orders that count as a real sale — everything except a cancelled order. */
const confirmedStatuses = ["new", "in_progress", "packed", "shipped", "delivered", "fulfilled"];

/** A piece is running low once this few (but more than zero) are left. */
const LOW_STOCK_THRESHOLD = 5;

function monthRange(offsetMonths: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 1);
  return { start, end };
}

/** Percent change, rounded, and safe when the prior period was zero. */
function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

async function revenueAndOrders(start: Date, end: Date) {
  const rows = await prisma.order.aggregate({
    _sum: { total: true },
    _count: true,
    where: {
      status: { in: confirmedStatuses },
      createdAt: { gte: start, lt: end },
    },
  });
  return { revenue: rows._sum.total ?? 0, orders: rows._count };
}

export async function dashboardStats() {
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(-1);

  const [current, previous, phones, unitsSold, outOfStock, lowStockProducts] =
    await Promise.all([
      revenueAndOrders(thisMonth.start, thisMonth.end),
      revenueAndOrders(lastMonth.start, lastMonth.end),
      prisma.order.findMany({ select: { phone: true } }),
      prisma.orderItem.aggregate({
        _sum: { qty: true },
        where: { order: { status: { in: confirmedStatuses } } },
      }),
      prisma.product.count({ where: { active: true, stock: 0 } }),
      prisma.product.findMany({
        where: { active: true, stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
        orderBy: { stock: "asc" },
        select: {
          stock: true,
          categories: { take: 1, select: { name: true } },
        },
      }),
    ]);

  const totalCustomers = new Set(phones.map((p) => normalisePhone(p.phone))).size;

  return {
    revenue: current.revenue,
    revenueDelta: percentChange(current.revenue, previous.revenue),
    orders: current.orders,
    ordersDelta: percentChange(current.orders, previous.orders),
    totalCustomers,
    productsSold: unitsSold._sum.qty ?? 0,
    lowStockCount: lowStockProducts.length + outOfStock,
    lowStockExample: lowStockProducts[0]
      ? {
          category: lowStockProducts[0].categories[0]?.name ?? "Uncategorised",
          left: lowStockProducts[0].stock,
        }
      : null,
  };
}

export async function ordersNeedingAttention() {
  const [count, latest] = await Promise.all([
    prisma.order.count({ where: { status: "new" } }),
    prisma.order.findFirst({
      where: { status: "new" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
  ]);
  return { count, latestId: latest?.id ?? null };
}

export type RevenueDay = { label: string; date: string; revenue: number };

/** Daily revenue for the trailing `days` days, oldest first, today included. */
export async function revenueByDay(days: number): Promise<RevenueDay[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const orders = await prisma.order.findMany({
    where: { status: { in: confirmedStatuses }, createdAt: { gte: start } },
    select: { total: true, createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    buckets.set(d.toDateString(), 0);
  }
  for (const order of orders) {
    const key = order.createdAt.toDateString();
    buckets.set(key, (buckets.get(key) ?? 0) + order.total);
  }

  return [...buckets.entries()].map(([key, revenue]) => {
    const d = new Date(key);
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      date: key,
      revenue,
    };
  });
}

export type CategorySales = { name: string; units: number };

/** Units sold per category, from confirmed orders whose items still link to a product. */
export async function salesByCategory(): Promise<CategorySales[]> {
  const items = await prisma.orderItem.findMany({
    where: { order: { status: { in: confirmedStatuses } }, productId: { not: null } },
    select: { qty: true, product: { select: { categories: { select: { name: true } } } } },
  });

  const totals = new Map<string, number>();
  for (const item of items) {
    const categories = item.product?.categories ?? [];
    const names = categories.length > 0 ? categories.map((c) => c.name) : ["Uncategorised"];
    for (const name of names) {
      totals.set(name, (totals.get(name) ?? 0) + item.qty);
    }
  }

  return [...totals.entries()]
    .map(([name, units]) => ({ name, units }))
    .sort((a, b) => b.units - a.units);
}
