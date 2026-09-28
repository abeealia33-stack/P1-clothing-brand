import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import ClothImage from "@/components/ClothImage";
import OrderCelebration from "@/components/OrderCelebration";
import PaymentTransfer from "@/components/PaymentTransfer";
import PrintReceipt from "@/components/PrintReceipt";
import { getOrder } from "@/lib/orders-db";
import { getSettings } from "@/lib/settings";
import { priceLabel } from "@/lib/format";
import { deliveryWindowLabel, isFastCity } from "@/lib/shipping";
import { isTransferMethod, paymentLabel, paymentMethods } from "@/lib/types";
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
  /* Called again rather than reusing `transfer` above: this one narrows the
     payment method to the three that have an account, which is what lets it
     index the accounts at all. */
  const account = isTransferMethod(order.payment)
    ? ((await getSettings()).payments[order.payment] ?? null)
    : null;

  return (
    <div className="confirm mx-auto max-w-7xl px-5 py-12 md:px-16 md:py-16">
      <div className="md:grid md:grid-cols-[1.2fr_1fr] md:items-start md:gap-14">
        <div className="confirm-main">
          <div className="flex items-start gap-4">
            <span className="confirm-tick" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12.5l5.5 5.5L20 7" />
              </svg>
            </span>
            <div>
              <p className="field-label" style={{ color: "var(--color-ink-soft)" }}>
                Order confirmed
              </p>
              <h1 className="settle mt-1 text-[2.25rem] leading-tight md:text-[3rem]">
                Shukriya, {order.name.split(" ")[0]}
              </h1>
            </div>
          </div>

          <p className="measure mt-5">
            Your order <span className="tnum font-medium">{order.id}</span> is in.
            We will ring <span className="tnum">{order.phone}</span> to confirm,
            and message you on WhatsApp the moment it leaves our Lahore studio.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="confirm-box">
              <p className="field-label" style={{ color: "var(--color-ink-soft)" }}>
                Delivering to
              </p>
              <address className="mt-3 text-sm leading-relaxed not-italic">
                {order.name}
                <br />
                {order.address}
                <br />
                {order.city}
                <br />
                <span className="tnum">{order.phone}</span>
              </address>
            </div>

            <div className="confirm-box">
              <p className="field-label" style={{ color: "var(--color-ink-soft)" }}>
                Delivery and payment
              </p>
              <ul className="mt-3 space-y-1 text-sm leading-relaxed">
                <li>
                  {isFastCity(order.city)
                    ? site.shipping.majorCities
                    : site.shipping.elsewhere}{" "}
                  by courier
                </li>
                <li className="tnum">
                  {paymentLabel(order.payment)}, {priceLabel(order.total)}
                </li>
                <li style={{ color: "var(--color-ink-soft)" }}>
                  Estimated {deliveryWindowLabel(order.city, new Date(order.createdAt))}
                </li>
              </ul>
            </div>
          </div>

          {order.notes && (
            <p className="confirm-note mt-4">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 17l14-14 4 4-14 14H3v-4Z" />
              </svg>
              <span>Your note for the courier: {order.notes}</span>
            </p>
          )}

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

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href={`/track?q=${encodeURIComponent(order.id)}`} className="btn btn-buy">
              Track your order
            </Link>
            <Link href="/shop" className="btn btn-quiet">
              Continue shopping
            </Link>
          </div>

          <div className="mt-6">
            <OrderCelebration orderId={order.id} />
          </div>
        </div>

        {/* The whole order written down in one place — and the one page a
            customer actually wants on paper, so it prints on its own. */}
        <div className="confirm-receipt mt-10 md:mt-0">
          <h2 className="tnum text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Order {order.id}
          </h2>

          <ul className="mt-5 space-y-4">
            {order.lines.map((line) => (
              <li key={line.id} className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div
                    className="h-16 w-14 overflow-hidden"
                    style={{ background: "var(--color-khaddar)" }}
                  >
                    {line.photo && <ClothImage src={line.photo} alt="" />}
                  </div>
                  <span className="qty-badge tnum">{line.qty}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{line.name}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--color-ink-soft)" }}>
                    {line.color} · {line.size}
                  </p>
                </div>
                <p className="tnum shrink-0 text-sm">
                  {priceLabel(line.price * line.qty)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="rule tnum mt-6 space-y-2 pt-5 text-sm">
            <div className="flex justify-between">
              <dt style={{ color: "var(--color-ink-soft)" }}>Subtotal</dt>
              <dd>{priceLabel(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt style={{ color: "var(--color-ink-soft)" }}>Delivery</dt>
              <dd>{order.shipping === 0 ? "Free" : priceLabel(order.shipping)}</dd>
            </div>
          </dl>

          <div className="rule tnum mt-4 flex items-baseline justify-between gap-4 pt-4">
            <p className="field-label">
              {order.payment === "cod" ? "Paid on delivery" : "Total"}
            </p>
            <p className="text-2xl">{priceLabel(order.total)}</p>
          </div>

          <PrintReceipt />
        </div>
      </div>
    </div>
  );
}
