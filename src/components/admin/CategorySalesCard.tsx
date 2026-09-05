import type { CategorySales } from "@/lib/dashboard-db";

/** The first three slots of the validated categorical order; a fourth
 * category folds into "Other" rather than reaching for a fourth hue. */
const seriesColors = [
  "var(--color-admin-chart-1)",
  "var(--color-admin-chart-2)",
  "var(--color-admin-chart-3)",
];
const otherColor = "var(--color-admin-chart-other)";

export default function CategorySalesCard({ data }: { data: CategorySales[] }) {
  const top = data.slice(0, 3);
  const otherUnits = data.slice(3).reduce((sum, c) => sum + c.units, 0);
  const rows =
    otherUnits > 0 ? [...top, { name: "Other", units: otherUnits }] : top;
  const total = rows.reduce((sum, r) => sum + r.units, 0);

  return (
    <div
      className="rounded-lg px-4 py-3.5"
      style={{ background: "var(--color-admin-card)", boxShadow: "var(--shadow-admin-card)" }}
    >
      <h2 className="text-sm" style={{ color: "var(--color-admin-ink)" }}>
        Sales by category
      </h2>

      {rows.length === 0 ? (
        <p className="mt-4 text-xs" style={{ color: "var(--color-admin-ink-soft)" }}>
          No confirmed sales yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row, i) => {
            const color = i < 3 ? seriesColors[i] : otherColor;
            const pct = total > 0 ? Math.round((row.units / total) * 100) : 0;
            return (
              <li key={row.name}>
                <div className="flex items-center justify-between gap-3 text-[0.8125rem]">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="truncate" style={{ color: "var(--color-admin-ink)" }}>
                      {row.name}
                    </span>
                  </span>
                  <span className="tnum shrink-0" style={{ color: "var(--color-admin-ink-soft)" }}>
                    {row.units}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1 overflow-hidden rounded-full"
                  style={{ background: "var(--color-admin-bg)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
