"use client";

import { useState } from "react";
import { deleteProductAction } from "@/app/admin/products/actions";

/**
 * Deleting is permanent, so it asks first — and says plainly what survives it.
 * Hiding is offered right next to it, because that is usually what is wanted.
 */
export default function DeleteProduct({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [asking, setAsking] = useState(false);

  return (
    <section className="rule mt-12 max-w-2xl pt-6">
      <h2 className="text-2xl">Remove this piece</h2>

      {!asking ? (
        <>
          <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            If it is only sold out for now, untick “Show in the shop” above
            instead — deleting cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setAsking(true)}
            className="mt-4 h-12 border px-4 text-sm"
            style={{ borderColor: "var(--color-alert)", color: "var(--color-alert)" }}
          >
            Delete {name}
          </button>
        </>
      ) : (
        <div className="mt-3 border p-4" style={{ borderColor: "var(--color-alert)" }}>
          <p className="measure text-sm">
            Delete <strong>{name}</strong> for good? Past orders keep their own
            record of it, so your order history stays correct — but the piece
            disappears from the shop and cannot be brought back.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={deleteProductAction}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="h-12 px-4 text-sm text-white"
                style={{ background: "var(--color-alert)" }}
              >
                Yes, delete it
              </button>
            </form>
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="btn btn-quiet"
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
