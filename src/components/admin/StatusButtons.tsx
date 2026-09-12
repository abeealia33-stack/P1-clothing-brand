"use client";

import { useActionState } from "react";
import { setStatusAction, type StatusState } from "@/app/admin/orders/actions";
import {
  advanceLabel,
  statusButtonLabel,
  statusFlow,
  statusOrder,
  type OrderStatus,
} from "@/lib/types";

/**
 * One tap moves the order to the next stage.
 *
 * The main button says what she is about to do, not what the order currently
 * is — "Mark as shipped", not "Shipped". The remaining stages sit behind it as
 * quieter buttons for correcting a mistake or calling an order off.
 */
export default function StatusButtons({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [state, action, pending] = useActionState<StatusState, FormData>(
    setStatusAction,
    {}
  );

  const at = statusOrder.indexOf(status);
  const next =
    at >= 0 && at < statusOrder.length - 1 ? statusOrder[at + 1] : null;

  const others = statusFlow.filter((s) => s.value !== status && s.value !== next);

  return (
    <div className="mt-6">
      <form action={action}>
        <input type="hidden" name="id" value={orderId} />

        {next && (
          <button
            type="submit"
            name="status"
            value={next}
            disabled={pending}
            className="btn btn-ink w-full sm:w-auto"
          >
            {pending ? "Saving" : advanceLabel[next]}
          </button>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((s) => (
            <button
              key={s.value}
              type="submit"
              name="status"
              value={s.value}
              disabled={pending}
              className="h-10 border px-3 text-sm transition-colors disabled:opacity-45"
              style={{
                borderColor: "var(--color-line)",
                color:
                  s.value === "cancelled"
                    ? "var(--color-alert)"
                    : "var(--color-ink-soft)",
              }}
            >
              {statusButtonLabel(status, s.value)}
            </button>
          ))}
        </div>
      </form>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
        {state.error ? (
          <span style={{ color: "var(--color-alert)" }}>{state.error}</span>
        ) : state.savedAt ? (
          <span style={{ color: "var(--color-sage-deep)" }}>Saved.</span>
        ) : null}
      </p>
    </div>
  );
}
