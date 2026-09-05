import Link from "next/link";

const accents: Record<"clay" | "sage", string> = {
  clay: "var(--color-admin-accent-clay)",
  sage: "var(--color-admin-accent-sage)",
};

export default function AlertCard({
  accent,
  title,
  action,
  value,
  caption,
}: {
  accent: keyof typeof accents;
  title: string;
  action?: { label: string; href: string };
  value: number | string;
  caption: string;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-lg px-4 py-3.5"
      style={{
        background: "var(--color-admin-card)",
        boxShadow: "var(--shadow-admin-card)",
        borderLeft: `2px solid ${accents[accent]}`,
      }}
    >
      {/* The count leads: it is the thing being watched, and it sits on the
          same baseline as the label rather than stacked under it, so the row
          stays one line tall. */}
      <p className="tnum text-2xl leading-none" style={{ color: "var(--color-admin-ink)" }}>
        {value}
      </p>
      <div className="min-w-0 flex-1">
        <p className="text-[0.8125rem]" style={{ color: "var(--color-admin-ink)" }}>
          {title}
        </p>
        <p className="truncate text-xs" style={{ color: "var(--color-admin-ink-soft)" }}>
          {caption}
        </p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 rounded-md px-2.5 py-1 text-xs whitespace-nowrap"
          style={{ background: "var(--color-admin-bg)", color: "var(--color-admin-ink)" }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
