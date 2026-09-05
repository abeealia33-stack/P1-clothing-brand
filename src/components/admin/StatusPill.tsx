import type { OrderStatus } from "@/lib/types";

/**
 * Colour carries meaning here, so it never carries it alone — the word is
 * always there too.
 */
const looks: Record<OrderStatus, { label: string; bg: string; fg: string }> = {
  new: { label: "New", bg: "#5C6B58", fg: "#fff" },
  in_progress: { label: "In progress", bg: "#8B9E8B", fg: "#fff" },
  shipped: { label: "Shipped", bg: "#E8DFD4", fg: "#2C2C2C" },
  delivered: { label: "Delivered", bg: "transparent", fg: "#6B6055" },
  cancelled: { label: "Cancelled", bg: "transparent", fg: "#9A4A3C" },
};

export default function StatusPill({ status }: { status: OrderStatus }) {
  const look = looks[status] ?? looks.new;
  const outlined = look.bg === "transparent";

  return (
    <span
      className="shrink-0 px-2 py-0.5 text-[0.6875rem] whitespace-nowrap"
      style={{
        background: look.bg,
        color: look.fg,
        boxShadow: outlined ? `inset 0 0 0 1px ${look.fg}55` : undefined,
      }}
    >
      {look.label}
    </span>
  );
}
