import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClothImage from "@/components/ClothImage";
import StatusPill, { orderLooks } from "@/components/admin/StatusPill";
import StatusButtons from "@/components/admin/StatusButtons";
import PaymentPanel from "@/components/admin/PaymentPanel";
import { requireAdmin } from "@/lib/auth";
import { getOrder } from "@/lib/orders-db";
import { dateTimeLabel, priceLabel } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id}` };
}

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const pieces = order.lines.reduce((n, l) => n + l.qty, 0);
  const message = `Salam ${order.name.split(" ")[0]}! This is Bilques about your order ${order.id}.`;

  return (
    <div className="py-8">
      <Link
        href="/admin/orders"
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="tnum text-4xl">{order.id}</h1>
        <StatusPill look={orderLooks[order.status]} />
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        Placed{" "}
        {dateTimeLabel(order.createdAt)}
      </p>

      <StatusButtons orderId={order.id} status={order.status} />

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="text-2xl">Send it to</h2>
          <div className="mt-3 space-y-1">
            <p className="font-medium">{order.name}</p>
            <p className="tnum">{order.phone}</p>
            <p style={{ color: "var(--color-ink-soft)" }}>{order.address}</p>
            <p style={{ color: "var(--color-ink-soft)" }}>{order.city}</p>
          </div>

          {order.notes && (
            <div
              className="mt-4 border-l-2 py-2 pl-3 text-sm"
              style={{ borderColor: "var(--color-sage)" }}
            >
              <span style={{ color: "var(--color-ink-soft)" }}>
                They added:{" "}
              </span>
              {order.notes}
            </div>
          )}

          {/* The two things she actually does next: call, or message. */}
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="btn btn-quiet">
              Call {order.name.split(" ")[0]}
            </a>
            <a href={whatsappLink(message)} className="btn btn-sage">
              WhatsApp
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-2xl">
            {pieces} {pieces === 1 ? "piece" : "pieces"}
          </h2>
          <ul className="mt-3">
            {order.lines.map((line) => (
              <li key={line.id} className="rule flex gap-3 py-3">
                <div className="aspect-[3/4] w-12 shrink-0 overflow-hidden">
                  <ClothImage src={line.photo} alt="" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{line.name}</p>
                  <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                    {line.color}, size {line.size}
                    {line.qty > 1 ? ` × ${line.qty}` : ""}
                  </p>
                </div>
                <p className="tnum shrink-0 text-sm">
                  {priceLabel(line.price * line.qty)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="rule tnum mt-3 space-y-1.5 pt-4 text-sm">
            <div className="flex justify-between">
              <dt style={{ color: "var(--color-ink-soft)" }}>Pieces</dt>
              <dd>{priceLabel(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt style={{ color: "var(--color-ink-soft)" }}>Shipping</dt>
              <dd>{order.shipping === 0 ? "Free" : priceLabel(order.shipping)}</dd>
            </div>
            <div className="rule flex justify-between pt-2 text-base">
              <dt>
                {order.payment === "cod" ? "Collect from customer" : "Total"}
              </dt>
              <dd>{priceLabel(order.total)}</dd>
            </div>
          </dl>

          <PaymentPanel
            orderId={order.id}
            payment={order.payment}
            paymentStatus={order.paymentStatus}
            paymentProof={order.paymentProof}
            paidAt={order.paidAt}
            total={priceLabel(order.total)}
          />
        </section>
      </div>
    </div>
  );
}
