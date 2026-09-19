"use client";

import { useActionState } from "react";
import PaymentAccountsEditor from "./PaymentAccountsEditor";
import PhotoUploader from "./PhotoUploader";
import { saveSettingsAction, type SettingsFormState } from "@/app/admin/settings/actions";
import type { PaymentAccounts } from "@/lib/settings";

export default function SettingsForm({
  heroImages,
  payments,
}: {
  heroImages: string[];
  payments: PaymentAccounts;
}) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    saveSettingsAction,
    {}
  );

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
        <label className="block text-sm font-medium">Hero banner</label>
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Shown at the top of the home page. Upload more than one and they
          fade from one to the next automatically. Leave empty to use the
          plain default image.
        </p>
        <div className="mt-2">
          <PhotoUploader name="heroImages" initial={heroImages} purpose="feature" />
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
        <button type="submit" disabled={pending} className="btn btn-ink">
          {pending ? "Saving" : "Save"}
        </button>
      </div>
    </form>
  );
}
