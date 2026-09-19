"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * A browser that could not reach the server at all, rather than a server that
 * answered with a problem. Each browser words it differently for the same
 * thing: the request left and nothing came back.
 */
function isNetworkFailure(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") || // Chrome, Edge
    message.includes("networkerror") || // Firefox
    message.includes("load failed") // Safari
  );
}

/**
 * The back-office counterpart: plainer, and it names the failure.
 *
 * It deliberately does not say whether anything was saved, because it cannot
 * know. This boundary catches everything in the admin — a page that would not
 * render, a save that was refused, a connection that dropped after the write
 * went through — and an earlier version told the owner "nothing was saved"
 * every time, which sent us looking at the database for a fault that was in
 * the connection.
 */
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

  const dropped = isNetworkFailure(error);

  return (
    <div className="py-10">
      <h1 className="text-2xl" style={{ color: "var(--color-admin-ink)" }}>
        {dropped ? "The server did not answer" : "That page could not be loaded"}
      </h1>
      <p className="measure mt-3 text-sm" style={{ color: "var(--color-admin-ink-soft)" }}>
        {dropped
          ? "The request left this page but nothing came back, so it is not known whether it went through. Open the list and check before trying again."
          : "Try again. If it keeps failing, the message below is what went wrong."}
      </p>
      <p className="measure mt-3 text-sm" style={{ color: "var(--color-admin-ink-soft)" }}>
        {error.message}
        {/* The one string that ties this to a line in the server log. */}
        {error.digest && ` (reference ${error.digest})`}
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
