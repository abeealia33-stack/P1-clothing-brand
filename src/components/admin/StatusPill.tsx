import type { CustomRequestStatus, OrderStatus } from "@/lib/types";

/**
 * Colour carries meaning here, so it never carries it alone — the word is
 * always there too.
 *
 * Orders and custom requests move through different stages but read as one
 * list to the owner, so they share the pill and differ only in the table
 * below: restyling the badge is one edit, not two that can drift apart.
 */
/** A stage with nothing left to do is outlined rather than filled in. */
export type StatusLook = { label: string; bg: string; fg: string; ring?: string };

const sageDeep = "var(--color-sage-deep)";
const sage = "var(--color-sage)";
const quiet = { bg: "transparent", fg: "var(--color-ink-soft)", ring: "#6b605555" };

export const orderLooks: Record<OrderStatus, StatusLook> = {
  new: { label: "New", bg: sageDeep, fg: "#fff" },
  in_progress: { label: "In progress", bg: sage, fg: "#fff" },
  shipped: { label: "Shipped", bg: "var(--color-khaddar)", fg: "var(--color-ink)" },
  delivered: { label: "Delivered", ...quiet },
  cancelled: {
    label: "Cancelled",
    bg: "transparent",
    fg: "var(--color-alert)",
    ring: "#9a4a3c55",
  },
};

export const customRequestLooks: Record<CustomRequestStatus, StatusLook> = {
  new: { label: "New", bg: sageDeep, fg: "#fff" },
  contacted: { label: "Contacted", bg: sage, fg: "#fff" },
  closed: { label: "Closed", ...quiet },
};

export default function StatusPill({ look }: { look: StatusLook }) {
  return (
    <span
      className="shrink-0 px-2 py-0.5 text-[0.6875rem] whitespace-nowrap"
      style={{
        background: look.bg,
        color: look.fg,
        boxShadow: look.ring ? `inset 0 0 0 1px ${look.ring}` : undefined,
      }}
    >
      {look.label}
    </span>
  );
}
