import Link from "next/link";
import { priceLabel } from "@/lib/format";
import type { RevenueDay } from "@/lib/dashboard-db";

export default function RevenueChart({
  data,
  activeRange,
}: {
  data: RevenueDay[];
  activeRange: 7 | 30;
}) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const todayKey = new Date().toDateString();

  return (
    <div
      className="rounded-lg px-4 py-3.5"
      style={{ background: "var(--color-admin-card)", boxShadow: "var(--shadow-admin-card)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm" style={{ color: "var(--color-admin-ink)" }}>
          Revenue overview
        </h2>
        <div className="flex overflow-hidden rounded-md" style={{ background: "var(--color-admin-bg)" }}>
          {([7, 30] as const).map((range) => (
            <Link
              key={range}
              href={`/admin?days=${range}`}
              className="px-2.5 py-1 text-xs whitespace-nowrap"
              style={
                activeRange === range
                  ? { background: "var(--color-admin-ink)", color: "#fff" }
                  : { color: "var(--color-admin-ink-soft)" }
              }
            >
              Last {range} days
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-5 flex h-32 items-end gap-1.5 sm:gap-2">
        {data.map((day) => {
          const isToday = day.date === todayKey;
          const heightPct = Math.max(4, Math.round((day.revenue / max) * 100));
          return (
            <div key={day.date} className="group relative flex min-w-0 flex-1 justify-center">
              <div
                className="w-full rounded-md transition-[height]"
                style={{
                  height: `${heightPct}%`,
                  background: isToday ? "var(--color-admin-ink)" : "var(--color-admin-line)",
                }}
              />
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg px-2 py-1 text-xs whitespace-nowrap group-hover:block"
                style={{ background: "var(--color-admin-ink)", color: "#fff" }}
              >
                {priceLabel(day.revenue)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {data.map((day) => (
          <span
            key={day.date}
            className="min-w-0 flex-1 truncate text-center text-[0.6875rem]"
            style={{ color: "var(--color-admin-ink-soft)" }}
          >
            {data.length > 7 ? "" : day.label}
          </span>
        ))}
      </div>
    </div>
  );
}
