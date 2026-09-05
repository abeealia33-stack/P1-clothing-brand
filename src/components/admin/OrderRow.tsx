import Link from "next/link";
import { priceLabel } from "@/lib/format";
import type { Order } from "@/lib/types";
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
          <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
            {order.payment === "cod" ? "Cash on delivery" : "Paid another way"}
          </p>
        </div>
      </Link>
    </li>
  );
}
