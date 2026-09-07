import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import OrderCelebration from "@/components/OrderCelebration";
import PaymentTransfer from "@/components/PaymentTransfer";
import { getOrder } from "@/lib/orders-db";
import { getSettings } from "@/lib/settings";
import { priceLabel } from "@/lib/format";
import {
  isTransferMethod,
  paymentLabel,
  paymentMethods,
  statusLabel,
} from "@/lib/types";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Order placed" };

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: requested } = await searchParams;

  /* Order numbers are short enough to guess, so the full confirmation — name,
     phone, address — is shown only to the browser that just placed it. Anyone
     else gets pointed at Track Order, which reveals far less. */
  const store = await cookies();
  const own = store.get("bilques_order")?.value;
  const order = own && own === requested ? await getOrder(own) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="text-4xl">We cannot show that order here</h1>
        <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
          Confirmations only open on the device that placed the order. Look it up
          on the Track Order page with your order number or mobile number, or
          message us and we will find it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/track" className="btn btn-ink">
            Track an order
          </Link>
          <a
            href={whatsappLink("Salam! I placed an order but cannot see it.")}
            className="btn btn-quiet"
          >
            Message on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const method = paymentMethods.find((m) => m.value === order.payment);

  /* Bank and wallet orders are only half done at this point — the money has
     not moved yet — so the accounts to send it to come along with the page. */
  const transfer = isTransferMethod(order.payment);
  const account = isTransferMethod(order.payment)
    ? ((await getSettings()).payments[order.payment] ?? null)
    : null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <p className="urdu text-2xl" style={{ color: "var(--color-sage-deep)" }}>
        شکریہ
      </p>
      <h1 className="settle mt-1 text-5xl md:text-6xl">Order placed</h1>
      <p className="measure mt-4">
        Thank you, {order.name.split(" ")[0]}. We will call{" "}
        <span className="tnum">{order.phone}</span> to confirm before the courier
        picks it up.
      </p>

      <div className="mt-8 p-5" style={{ background: "var(--color-khaddar)" }}>
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Your order number — keep it to track delivery
        </p>
        <p
          className="tnum mt-1 text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {order.id}
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {statusLabel[order.status]}. {site.shipping.majorCities} in major
          cities, {site.shipping.elsewhere} elsewhere.
        </p>
        <div className="mt-4">
          <OrderCelebration orderId={order.id} />
        </div>
      </div>

      <ul className="rule mt-8 pt-6">
        {order.lines.map((line) => (
          <li key={line.id} className="flex justify-between gap-4 py-2 text-sm">
            <span>
              {line.name}
              <span style={{ color: "var(--color-ink-soft)" }}>
                {" "}
                — {line.color}, size {line.size}
                {line.qty > 1 ? `, ${line.qty} pieces` : ""}
              </span>
            </span>
            <span className="tnum shrink-0">
              {priceLabel(line.price * line.qty)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="rule tnum mt-4 space-y-2 pt-4 text-sm">
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{order.shipping === 0 ? "Free" : priceLabel(order.shipping)}</dd>
        </div>
        <div className="flex justify-between text-base">
          <dt>{order.payment === "cod" ? "Pay the courier" : "Total"}</dt>
          <dd>{priceLabel(order.total)}</dd>
        </div>
      </dl>

      {transfer ? (
        <PaymentTransfer
          orderId={order.id}
          methodLabel={paymentLabel(order.payment)}
          amount={priceLabel(order.total)}
          account={account}
          paymentStatus={order.paymentStatus}
          initialProof={order.paymentProof}
          whatsappHref={whatsappLink(
            `Salam! I have paid for order ${order.id} by ${paymentLabel(
              order.payment
            ).toLowerCase()}. Here is the receipt.`
          )}
        />
      ) : (
        <p className="measure mt-4 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {method?.note}
        </p>
      )}

      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          href={`/track?q=${encodeURIComponent(order.id)}`}
          className="btn btn-ink"
        >
          Track this order
        </Link>
        <Link href="/shop" className="btn btn-quiet">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
