"use client";

import Link from "next/link";
import { useEffect } from "react";

/** The back-office counterpart: plainer, and it names the failure. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-10">
      <h1 className="text-2xl" style={{ color: "var(--color-admin-ink)" }}>
        That page could not be loaded
      </h1>
      <p className="measure mt-3 text-sm" style={{ color: "var(--color-admin-ink-soft)" }}>
        Nothing was saved. Try again — if it keeps failing, the database
        connection is the usual cause.
      </p>
      <p className="measure mt-3 text-sm" style={{ color: "var(--color-admin-ink-soft)" }}>
        {error.message}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="flex h-9 items-center rounded-md px-3 text-[0.8125rem]"
          style={{ background: "var(--color-admin-ink)", color: "#fff" }}
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="flex h-9 items-center rounded-md px-3 text-[0.8125rem]"
          style={{ background: "var(--color-admin-card)", color: "var(--color-admin-ink)", boxShadow: "var(--shadow-admin-card)" }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
