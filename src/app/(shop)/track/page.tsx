import type { Metadata } from "next";
import Link from "next/link";
import { findOrderForCustomer } from "@/lib/orders-db";
import { priceLabel } from "@/lib/format";
import { isTransferMethod, statusLabel, type OrderStatus } from "@/lib/types";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Track your order" };

const steps: { key: OrderStatus; label: string }[] = [
  { key: "new", label: "Received" },
  { key: "in_progress", label: "Being prepared" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const asked = q.trim().length > 0;
  const order = asked ? await findOrderForCustomer(q) : null;
  const reached = order ? steps.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-5xl md:text-6xl">Track your order</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        Enter the order number from your confirmation, or the mobile number you
        ordered with. No account, no password.
      </p>

      {/* A plain GET form: it works before the JavaScript arrives, and the
          lookup is a link you can send to someone. */}
      <form action="/track" className="mt-6 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="BQ-2609-1234 or 0300 1234567"
          aria-label="Order number or mobile number"
          className="field"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-ink shrink-0">
          Find it
        </button>
      </form>

      {asked && !order && (
        <div className="mt-8">
          <h2 className="text-2xl">No order under that</h2>
          <p className="measure mt-2" style={{ color: "var(--color-ink-soft)" }}>
            Check the number on your confirmation, or try the mobile number you
            ordered with. We can also look it up for you.
          </p>
          <a
            href={whatsappLink("Salam! Can you check my order status?")}
            className="btn btn-quiet mt-5"
          >
            Ask on WhatsApp
          </a>
        </div>
      )}

      {order && (
        <div className="mt-8">
          <p className="tnum text-sm" style={{ color: "var(--color-ink-soft)" }}>
            {order.id} — placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "long",
            })}
          </p>
          <h2 className="mt-1 text-3xl">{statusLabel[order.status]}</h2>

          {order.status === "cancelled" ? (
            <p className="measure mt-4" style={{ color: "var(--color-ink-soft)" }}>
              This order was cancelled. If that is a surprise, message us and we
              will sort it out.
            </p>
          ) : (
            <ol className="mt-7">
              {steps.map((step, i) => {
                const done = reached >= i;
                return (
                  <li key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className="mt-1.5 h-2.5 w-2.5 rounded-full"
                        style={{
                          background: done
                            ? "var(--color-sage-deep)"
                            : "var(--color-line)",
                        }}
                      />
                      {i < steps.length - 1 && (
                        <span
                          className="w-px flex-1"
                          style={{
                            background: done
                              ? "var(--color-sage)"
                              : "var(--color-line)",
                            minHeight: "2.25rem",
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="pb-4 text-sm"
                      style={{
                        color: done ? "var(--color-ink)" : "var(--color-ink-soft)",
                      }}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <ul className="rule pt-5">
            {order.lines.map((line) => (
              <li
                key={line.id}
                className="flex justify-between gap-4 py-2 text-sm"
              >
                <span>
                  {line.name}
                  <span style={{ color: "var(--color-ink-soft)" }}>
                    {" "}
                    — {line.color}, size {line.size}
                  </span>
                </span>
                <span className="tnum shrink-0">
                  {priceLabel(line.price * line.qty)}
                </span>
              </li>
            ))}
          </ul>

          <p className="tnum rule mt-3 pt-4 text-sm">
            {order.payment === "cod" ? "Pay the courier" : "Total"}:{" "}
            {priceLabel(order.total)}
          </p>

          {/* Someone who has transferred money and heard nothing back will
              check here before they message. Cash on delivery says nothing —
              there is nothing to wait on. */}
          {isTransferMethod(order.payment) && (
            <p
              className="mt-1 text-sm"
              style={{
                color:
                  order.paymentStatus === "paid"
                    ? "var(--color-sage-deep)"
                    : "var(--color-ink-soft)",
              }}
            >
              {order.paymentStatus === "paid"
                ? "Payment received."
                : order.paymentStatus === "review"
                  ? "We have your receipt and are checking it."
                  : "Waiting on your transfer."}
            </p>
          )}

          {/* Delivering to the city only. Anyone can run this lookup, so the
              street address stays on the confirmation page. */}
          <p
            className="measure mt-6 text-sm"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Delivering to {order.city}.{" "}
            <Link href="/contact" className="underline underline-offset-4">
              Something wrong with this?
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
