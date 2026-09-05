import type { Metadata } from "next";
import StatCard from "@/components/admin/StatCard";
import AlertCard from "@/components/admin/AlertCard";
import RevenueChart from "@/components/admin/RevenueChart";
import CategorySalesCard from "@/components/admin/CategorySalesCard";
import { requireAdmin } from "@/lib/auth";
import { priceLabel } from "@/lib/format";
import {
  dashboardStats,
  ordersNeedingAttention,
  revenueByDay,
  salesByCategory,
} from "@/lib/dashboard-db";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdmin();

  const { days: daysParam } = await searchParams;
  const range = daysParam === "30" ? 30 : 7;

  const [stats, attention, revenue, categories] = await Promise.all([
    dashboardStats(),
    ordersNeedingAttention(),
    revenueByDay(range),
    salesByCategory(),
  ]);

  return (
    <div className="py-6">
      <h1 className="text-2xl" style={{ color: "var(--color-admin-ink)" }}>
        Dashboard
      </h1>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="banknote"
          tint="clay"
          label="Revenue"
          value={priceLabel(stats.revenue)}
          delta={stats.revenueDelta}
          caption="vs last month"
        />
        <StatCard
          icon="bag"
          tint="sage"
          label="Total orders"
          value={String(stats.orders)}
          delta={stats.ordersDelta}
          caption="vs last month"
        />
        <StatCard
          icon="users"
          tint="slate"
          label="Total customers"
          value={String(stats.totalCustomers)}
          caption="Distinct phone numbers across orders"
        />
        <StatCard
          icon="shirt"
          tint="gold"
          label="Products sold"
          value={String(stats.productsSold)}
          caption="Units across confirmed orders"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <AlertCard
          accent="clay"
          title="Orders need attention"
          action={{ label: "Review queue", href: "/admin/orders?status=new" }}
          value={attention.count}
          caption={attention.latestId ? `Latest: ${attention.latestId}` : "Nothing waiting"}
        />
        <AlertCard
          accent="sage"
          title="Low stock watch"
          action={{ label: "Open catalogue", href: "/admin/products" }}
          value={stats.lowStockCount}
          caption={
            stats.lowStockExample
              ? `${stats.lowStockExample.category} / ${stats.lowStockExample.left} left`
              : "Everything is well stocked"
          }
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} activeRange={range} />
        </div>
        <CategorySalesCard data={categories} />
      </div>
    </div>
  );
}
