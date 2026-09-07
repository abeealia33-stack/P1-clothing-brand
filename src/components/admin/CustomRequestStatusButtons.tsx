"use client";

import { useActionState } from "react";
import {
  setCustomRequestStatusAction,
  type StatusState,
} from "@/app/admin/custom-requests/actions";
import { customRequestStatusFlow, type CustomRequestStatus } from "@/lib/types";

const order: CustomRequestStatus[] = ["new", "contacted", "closed"];

export default function CustomRequestStatusButtons({
  requestId,
  status,
}: {
  requestId: string;
  status: CustomRequestStatus;
}) {
  const [state, action, pending] = useActionState<StatusState, FormData>(
    setCustomRequestStatusAction,
    {}
  );

  const at = order.indexOf(status);
  const next = at >= 0 && at < order.length - 1 ? order[at + 1] : null;
  const others = customRequestStatusFlow.filter(
    (s) => s.value !== status && s.value !== next
  );

  return (
    <div className="mt-6">
      <form action={action}>
        <input type="hidden" name="id" value={requestId} />

        {next && (
          <button
            type="submit"
            name="status"
            value={next}
            disabled={pending}
            className="btn btn-ink w-full sm:w-auto"
          >
            {pending
              ? "Saving"
              : next === "contacted"
                ? "Mark as contacted"
                : "Close request"}
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
              style={{ borderColor: "var(--color-line)", color: "var(--color-ink-soft)" }}
            >
              Put back to {s.label.toLowerCase()}
            </button>
          ))}
        </div>
      </form>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
        {state.error ? (
          <span style={{ color: "#9A4A3C" }}>{state.error}</span>
        ) : state.savedAt ? (
          <span style={{ color: "var(--color-sage-deep)" }}>Saved.</span>
        ) : null}
      </p>
    </div>
  );
}
