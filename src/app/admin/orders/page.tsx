import type { Metadata } from "next";
import Link from "next/link";
import OrderRow from "@/components/admin/OrderRow";
import FilterChip from "@/components/admin/FilterChip";
import { requireAdmin } from "@/lib/auth";
import { listOrders, orderSummary } from "@/lib/orders-db";
import { countProducts } from "@/lib/catalogue";
import { priceLabel } from "@/lib/format";
import { isOrderStatus, statusFlow, type OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

/* Orders change constantly and the owner is looking at them to decide what to
   do next, so this page is never served from a cache. */
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const filter: OrderStatus | undefined =
    status && isOrderStatus(status) ? status : undefined;

  const [orders, summary, products] = await Promise.all([
    listOrders(filter),
    orderSummary(),
    countProducts(),
  ]);

  return (
    <div className="py-6">
      <h1 className="text-2xl" style={{ color: "var(--color-admin-ink)" }}>
        Orders
      </h1>

      {/* Only the numbers that answer "what do I need to do today?" */}
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="New orders" value={summary.newCount} loud={summary.newCount > 0} />
        <Stat label="In progress" value={summary.inProgressCount} />
        <Stat label="Shipped" value={summary.shippedCount} />
        <Stat label="Money owed" value={priceLabel(summary.openValue)} />
      </dl>

      {products.outOfStock > 0 && (
        <p
          className="mt-4 border-l-2 py-2 pl-3 text-sm"
          style={{ borderColor: "var(--color-admin-accent-sage)" }}
        >
          {products.outOfStock}{" "}
          {products.outOfStock === 1 ? "piece is" : "pieces are"} showing in the
          shop with no stock left.{" "}
          <Link href="/admin/products" className="underline underline-offset-4">
            Update stock
          </Link>
        </p>
      )}

      <nav aria-label="Filter orders" className="rail -mx-4 mt-8 gap-2 px-4 sm:mx-0 sm:px-0">
        <FilterChip href="/admin/orders" active={!filter}>
          All
        </FilterChip>
        {statusFlow.map((s) => (
          <FilterChip
            key={s.value}
            href={`/admin/orders?status=${s.value}`}
            active={filter === s.value}
          >
            {s.label}
          </FilterChip>
        ))}
      </nav>

      {orders.length === 0 ? (
        <div
          className="mt-8 rounded-lg p-8 text-center"
          style={{ background: "var(--color-admin-card)", boxShadow: "var(--shadow-admin-card)" }}
        >
          <h2 className="text-2xl">
            {filter ? "Nothing in this pile" : "No orders yet"}
          </h2>
          <p className="measure mx-auto mt-2 text-sm" style={{ color: "var(--color-admin-ink-soft)" }}>
            {filter
              ? "Try another filter, or look at all orders."
              : "When someone orders from the shop, it appears here straight away."}
          </p>
        </div>
      ) : (
        <ul className="mt-6">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  loud = false,
}: {
  label: string;
  value: string | number;
  loud?: boolean;
}) {
  return (
    <div
      className="rounded-lg px-3.5 py-3"
      style={{
        background: loud ? "var(--color-admin-accent-sage-soft)" : "var(--color-admin-card)",
        boxShadow: "var(--shadow-admin-card)",
      }}
    >
      <dt className="text-xs" style={{ color: "var(--color-admin-ink-soft)" }}>
        {label}
      </dt>
      <dd className="tnum mt-1 text-xl leading-none" style={{ color: "var(--color-admin-ink)" }}>
        {value}
      </dd>
    </div>
  );
}

