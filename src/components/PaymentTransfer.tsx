"use client";

import { useId, useState } from "react";
import type { PaymentAccount } from "@/lib/settings";
import type { PaymentStatus } from "@/lib/types";

/**
 * Everything a customer needs to pay by transfer, on the page they land on
 * rather than in a WhatsApp message they have to wait for.
 *
 * Account numbers are copyable because nobody should be retyping an IBAN from
 * one phone screen into another, and the receipt goes straight to the order so
 * the owner is not matching screenshots to names by hand.
 */

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Older browsers and denied permissions: the number is on screen to be
         read either way, so this quietly stays a plain row. */
    }
  };

  return (
    <div className="rule flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        {label}
      </dt>
      <dd className="flex min-w-0 items-baseline gap-3">
        <span className="tnum truncate">{value}</span>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 text-xs underline underline-offset-4"
          style={{ color: "var(--color-sage-deep)" }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </dd>
    </div>
  );
}

export default function PaymentTransfer({
  orderId,
  methodLabel,
  amount,
  account,
  paymentStatus,
  initialProof,
  whatsappHref,
}: {
  orderId: string;
  methodLabel: string;
  /** Already formatted — this component does no arithmetic. */
  amount: string;
  account: PaymentAccount | null;
  paymentStatus: PaymentStatus;
  initialProof: string | null;
  whatsappHref: string;
}) {
  const [proof, setProof] = useState(initialProof);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);

    const body = new FormData();
    body.set("orderId", orderId);
    body.set("file", file);

    try {
      const response = await fetch("/api/payment-proof", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "That did not upload.");
      }
      setProof(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not upload.");
    } finally {
      setBusy(false);
    }
  };

  if (paymentStatus === "paid") {
    return (
      <section className="rule mt-8 pt-6">
        <h2 className="text-2xl">Payment received</h2>
        <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Your {methodLabel.toLowerCase()} of {amount} is with us. Nothing else
          to do — we will let you know when it ships.
        </p>
      </section>
    );
  }

  return (
    <section className="rule mt-8 pt-6">
      <h2 className="text-2xl">Send {amount}</h2>

      {account ? (
        <>
          <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            By {methodLabel.toLowerCase()}, to this account. Put your order
            number <span className="tnum">{orderId}</span> in the reference if
            your app allows one.
          </p>
          <dl className="mt-4">
            <CopyValue label="Account title" value={account.title} />
            <CopyValue label="Number" value={account.number} />
            {account.bank && <CopyValue label="Bank" value={account.bank} />}
            {account.iban && <CopyValue label="IBAN" value={account.iban} />}
          </dl>
        </>
      ) : (
        /* No account saved in the admin yet — the shop still works, it just
           falls back to the old way of handing the details over. */
        <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Message us on WhatsApp and we will send you the {methodLabel.toLowerCase()}{" "}
          details for order <span className="tnum">{orderId}</span> right away.
        </p>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-medium">Once you have sent it</h3>
        <p className="measure mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Upload the receipt here and we will confirm it. Your order is held
          either way — we only dispatch once the payment shows up.
        </p>

        {proof ? (
          <div className="mt-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proof}
              alt="The receipt you sent"
              className="h-20 w-20 border object-cover"
              style={{ borderColor: "var(--color-line)" }}
            />
            <div>
              <p className="text-sm" style={{ color: "var(--color-sage-deep)" }}>
                Receipt received.
              </p>
              <label
                htmlFor={inputId}
                className="cursor-pointer text-sm underline underline-offset-4"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Send a different one
              </label>
            </div>
          </div>
        ) : (
          <label htmlFor={inputId} className="btn btn-sage mt-4 cursor-pointer">
            {busy ? "Uploading" : "Upload receipt"}
          </label>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />

        <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm">
          {error && <span style={{ color: "var(--color-alert)" }}>{error}</span>}
        </p>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline underline-offset-4"
          style={{ color: "var(--color-sage-deep)" }}
        >
          Or send it on WhatsApp
        </a>
      </div>
    </section>
  );
}
