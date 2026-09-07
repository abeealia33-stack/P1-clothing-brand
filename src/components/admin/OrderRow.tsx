import Link from "next/link";
import { priceLabel } from "@/lib/format";
import { paymentLabel, type Order } from "@/lib/types";
import StatusPill from "./StatusPill";

/** How long ago, in the words someone would actually use. */
function ago(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
  });
}

export default function OrderRow({ order }: { order: Order }) {
  const pieces = order.lines.reduce((n, l) => n + l.qty, 0);

  return (
    <li className="rule">
      <Link
        href={`/admin/orders/${order.id}`}
        className="flex items-center gap-4 py-4 transition-colors hover:bg-khaddar/50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{order.name}</span>
            <StatusPill status={order.status} />
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
          {/* A receipt waiting to be checked is the one thing in this list she
              has to act on, so it is the only line that leaves the quiet
              secondary colour. */}
          <p
            className="text-xs"
            style={{
              color:
                order.paymentStatus === "paid"
                  ? "var(--color-sage-deep)"
                  : order.paymentStatus === "review"
                    ? "var(--color-ink)"
                    : "var(--color-ink-soft)",
              fontWeight: order.paymentStatus === "review" ? 500 : undefined,
            }}
          >
            {order.paymentStatus === "paid"
              ? "Paid"
              : order.paymentStatus === "review"
                ? "Receipt to check"
                : paymentLabel(order.payment)}
          </p>
        </div>
      </Link>
    </li>
  );
}
