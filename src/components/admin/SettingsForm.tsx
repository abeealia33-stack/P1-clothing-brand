"use client";

import { useActionState, useState } from "react";
import HeroEditor from "./HeroEditor";
import PaymentAccountsEditor from "./PaymentAccountsEditor";
import { saveSettingsAction, type SettingsFormState } from "@/app/admin/settings/actions";
import type { ProductChoice } from "@/lib/catalogue";
import type { HeroSettings } from "@/lib/hero";
import type { PaymentAccounts } from "@/lib/settings";
import type { ResolvedCollection } from "@/lib/types";

export default function SettingsForm({
  initialHero,
  payments,
  collections,
  products,
}: {
  initialHero: HeroSettings;
  payments: PaymentAccounts;
  collections: ResolvedCollection[];
  products: ProductChoice[];
}) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    saveSettingsAction,
    {}
  );
  const [hero, setHero] = useState(initialHero);
  // Counted rather than a flag: both photos can be uploading at once.
  const [busy, setBusy] = useState(0);

  return (
    <form action={action} className="mt-8 max-w-2xl">
      {state.errors?.form && (
        <p
          role="alert"
          className="mb-6 border p-4 text-sm"
          style={{ borderColor: "var(--color-alert)", color: "var(--color-alert)" }}
        >
          {state.errors.form}
        </p>
      )}

      <div className="mt-6">
        <p className="block text-sm font-medium">Hero banner</p>
        <p className="measure mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          The photo at the top of the home page, with one button on it. No
          words over the photo — the picture does the talking.
        </p>
        <input type="hidden" name="hero" value={JSON.stringify(hero)} />
        <div className="mt-4">
          <HeroEditor
            hero={hero}
            onChange={setHero}
            onBusyChange={(on) => setBusy((n) => n + (on ? 1 : -1))}
            collections={collections}
            products={products}
          />
        </div>
      </div>

      <div className="rule mt-8 pt-6">
        <label className="block text-sm font-medium">Where customers send money</label>
        <p className="measure mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Shown to the customer as soon as they place a bank or wallet order,
          with a button to send you the receipt. Leave a method blank and they
          are asked to message you for the details instead.
        </p>
        <div className="mt-4">
          <PaymentAccountsEditor name="payments" initial={payments} />
        </div>
      </div>

      <div className="rule mt-8 flex flex-wrap gap-3 pt-6">
        <button type="submit" disabled={pending || busy > 0} className="btn btn-ink">
          {pending ? "Saving" : busy > 0 ? "Waiting for photos" : "Save"}
        </button>
      </div>
    </form>
  );
}
