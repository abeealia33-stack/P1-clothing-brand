"use client";

import { useActionState } from "react";
import {
  setPaymentStatusAction,
  type StatusState,
} from "@/app/admin/orders/actions";
import {
  paymentLabel,
  paymentStatusLabel,
  type PaymentStatus,
} from "@/lib/types";

/**
 * Whether the money arrived, and the receipt the customer sent to prove it.
 *
 * Kept apart from the parcel's status buttons on purpose: an order can be
 * paid and unpacked, or shipped and still owing, and collapsing the two into
 * one row of buttons is how a shop loses track of who has paid.
 */
export default function PaymentPanel({
  orderId,
  payment,
  paymentStatus,
  paymentProof,
  paidAt,
  total,
}: {
  orderId: string;
  payment: string;
  paymentStatus: PaymentStatus;
  paymentProof: string | null;
  paidAt: string | null;
  /** Already formatted. */
  total: string;
}) {
  const [state, action, pending] = useActionState<StatusState, FormData>(
    setPaymentStatusAction,
    {}
  );

  const paid = paymentStatus === "paid";

  return (
    <section className="rule mt-8 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl">Payment</h2>
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {total} by {paymentLabel(payment).toLowerCase()}
        </p>
      </div>

      <p
        className="mt-2 text-sm"
        style={{ color: paid ? "var(--color-sage-deep)" : "var(--color-ink-soft)" }}
      >
        {paymentStatusLabel[paymentStatus]}
        {paid && paidAt
          ? ` — ${new Date(paidAt).toLocaleString("en-PK", {
              day: "numeric",
              month: "long",
              hour: "numeric",
              minute: "2-digit",
            })}`
          : ""}
      </p>

      {paymentProof && (
        <a
          href={paymentProof}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block"
          title="Open the receipt full size"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={paymentProof}
            alt="Receipt the customer uploaded"
            className="h-32 w-32 border object-cover"
            style={{ borderColor: "var(--color-admin-line)" }}
          />
        </a>
      )}

      <form action={action} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={orderId} />
        {paid ? (
          <button
            type="submit"
            name="paymentStatus"
            value="unpaid"
            disabled={pending}
            className="h-10 border px-3 text-sm transition-colors disabled:opacity-45"
            style={{ borderColor: "var(--color-line)", color: "var(--color-ink-soft)" }}
          >
            {pending ? "Saving" : "Mark as unpaid"}
          </button>
        ) : (
          <button
            type="submit"
            name="paymentStatus"
            value="paid"
            disabled={pending}
            className="btn btn-sage"
          >
            {pending ? "Saving" : "Mark payment received"}
          </button>
        )}
      </form>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
        {state.error ? (
          <span style={{ color: "var(--color-alert)" }}>{state.error}</span>
        ) : state.savedAt ? (
          <span style={{ color: "var(--color-sage-deep)" }}>Saved.</span>
        ) : null}
      </p>
    </section>
  );
}
