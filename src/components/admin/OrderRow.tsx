import Link from "next/link";
import { ago, priceLabel } from "@/lib/format";
import { paymentLabel, type Order, type PaymentStatus } from "@/lib/types";
import StatusPill, { orderLooks } from "./StatusPill";

/**
 * A receipt waiting to be checked is the one thing in this list the owner has
 * to act on, so it is the only line that leaves the quiet secondary colour.
 * Unpaid orders fall through to naming the method they chose.
 */
const paymentLook: Record<
  PaymentStatus,
  { color: string; weight?: number; text?: string }
> = {
  paid: { color: "var(--color-sage-deep)", text: "Paid" },
  review: { color: "var(--color-ink)", weight: 500, text: "Receipt to check" },
  unpaid: { color: "var(--color-ink-soft)" },
};

export default function OrderRow({ order }: { order: Order }) {
  const pieces = order.lines.reduce((n, l) => n + l.qty, 0);
  const look = paymentLook[order.paymentStatus];

  return (
    <li className="rule">
      <Link
        href={`/admin/orders/${order.id}`}
        className="flex items-center gap-4 py-4 transition-colors hover:bg-khaddar/50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{order.name}</span>
            <StatusPill look={orderLooks[order.status]} />
          </div>
          {/* Spaced columns rather than a dot-joined string: these are four
              separate facts, and they stay scannable down the list. */}
          <p
            className="tnum mt-0.5 flex flex-wrap gap-x-4 text-sm"
            style={{ color: "var(--color-ink-soft)" }}
          >
            <span>{order.id}</span>
            <span>
              {pieces} {pieces === 1 ? "piece" : "pieces"}
            </span>
            <span>{order.city}</span>
            <span>{ago(order.createdAt)}</span>
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="tnum">{priceLabel(order.total)}</p>
          <p className="text-xs" style={{ color: look.color, fontWeight: look.weight }}>
            {look.text ?? paymentLabel(order.payment)}
          </p>
        </div>
      </Link>
    </li>
  );
}
