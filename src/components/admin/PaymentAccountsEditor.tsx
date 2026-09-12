"use client";

import { useId, useState } from "react";
import type { PaymentAccounts } from "@/lib/settings";
import { paymentLabel, transferMethods, type TransferMethod } from "@/lib/types";

/**
 * The accounts customers are told to send money to.
 *
 * Whatever is filled in here appears on the confirmation page the moment an
 * order is placed; a method left blank falls back to promising the details on
 * WhatsApp, which is how the shop worked before. Submitted as one JSON field,
 * the same way the banner editor works.
 */

export default function PaymentAccountsEditor({
  name,
  initial,
}: {
  name: string;
  initial: PaymentAccounts;
}) {
  const [accounts, setAccounts] = useState<PaymentAccounts>(initial);
  const idBase = useId();

  const set = (
    method: TransferMethod,
    field: "title" | "number" | "bank" | "iban",
    value: string
  ) =>
    setAccounts((prev) => ({
      ...prev,
      [method]: {
        title: "",
        number: "",
        ...prev[method],
        [field]: value,
      },
    }));

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(accounts)} />

      <div className="space-y-6">
        {transferMethods.map((method) => {
          const account = accounts[method];
          const showBankFields = method === "bank";

          return (
            <fieldset key={method} className="border-0 p-0">
              <legend className="text-sm font-medium">
                {paymentLabel(method)}
              </legend>

              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                    Account title
                  </span>
                  <input
                    id={`${idBase}-${method}-title`}
                    className="field mt-1"
                    value={account?.title ?? ""}
                    onChange={(e) => set(method, "title", e.target.value)}
                    placeholder="Bilques"
                  />
                </label>

                <label className="block">
                  <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                    {showBankFields ? "Account number" : "Wallet number"}
                  </span>
                  <input
                    id={`${idBase}-${method}-number`}
                    className="field tnum mt-1"
                    inputMode="numeric"
                    value={account?.number ?? ""}
                    onChange={(e) => set(method, "number", e.target.value)}
                    placeholder={showBankFields ? "0123456789012" : "0312 4433199"}
                  />
                </label>

                {showBankFields && (
                  <>
                    <label className="block">
                      <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                        Bank
                      </span>
                      <input
                        id={`${idBase}-${method}-bank`}
                        className="field mt-1"
                        value={account?.bank ?? ""}
                        onChange={(e) => set(method, "bank", e.target.value)}
                        placeholder="Meezan Bank"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                        IBAN
                      </span>
                      <input
                        id={`${idBase}-${method}-iban`}
                        className="field tnum mt-1"
                        value={account?.iban ?? ""}
                        onChange={(e) => set(method, "iban", e.target.value)}
                        placeholder="PK00MEZN0000000000000000"
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Half a row is worse than none: the customer would be staring
                  at a number with nobody's name on it. */}
              {account && (!account.title?.trim() || !account.number?.trim()) && (
                <p className="mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                  Needs both a title and a number before customers see it.
                </p>
              )}
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
