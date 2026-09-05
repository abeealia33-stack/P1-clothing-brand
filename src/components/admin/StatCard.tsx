import { AdminIcon } from "./AdminIcon";
import type { AdminIconName } from "@/lib/admin-nav";

const tints: Record<"clay" | "sage" | "gold" | "slate", { bg: string; fg: string }> = {
  clay: { bg: "var(--color-admin-accent-clay-soft)", fg: "var(--color-admin-accent-clay)" },
  sage: { bg: "var(--color-admin-accent-sage-soft)", fg: "var(--color-admin-accent-sage)" },
  gold: { bg: "var(--color-admin-accent-gold-soft)", fg: "var(--color-admin-accent-gold)" },
  slate: { bg: "var(--color-admin-accent-slate-soft)", fg: "var(--color-admin-accent-slate)" },
};

export default function StatCard({
  icon,
  tint,
  label,
  value,
  delta,
  caption,
}: {
  icon: AdminIconName;
  tint: keyof typeof tints;
  label: string;
  value: string;
  /** Percent vs last month. Omit when there's nothing to compare against. */
  delta?: number;
  caption: string;
}) {
  const t = tints[tint];

  return (
    <div
      className="rounded-lg px-4 py-3.5"
      style={{ background: "var(--color-admin-card)", boxShadow: "var(--shadow-admin-card)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex size-6 items-center justify-center rounded-md"
          style={{ background: t.bg, color: t.fg }}
        >
          <AdminIcon name={icon} className="size-3.5" />
        </span>
        <p className="text-[0.8125rem]" style={{ color: "var(--color-admin-ink-soft)" }}>
          {label}
        </p>
        {delta !== undefined && (
          <span
            className="tnum ml-auto text-xs"
            style={{ color: "var(--color-admin-ink-soft)" }}
          >
            {delta === 0 ? "±0%" : `${delta > 0 ? "+" : "−"}${Math.abs(delta)}%`}
          </span>
        )}
      </div>

      <p className="tnum mt-2 text-2xl leading-none" style={{ color: "var(--color-admin-ink)" }}>
        {value}
      </p>
      <p className="mt-1.5 text-xs" style={{ color: "var(--color-admin-ink-soft)" }}>
        {caption}
      </p>
    </div>
  );
}
