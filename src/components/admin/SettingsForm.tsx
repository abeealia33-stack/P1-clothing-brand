"use client";

import { useActionState } from "react";
import BannerEditor from "./BannerEditor";
import PhotoUploader from "./PhotoUploader";
import { saveSettingsAction, type SettingsFormState } from "@/app/admin/settings/actions";
import type { PromoBanner } from "@/lib/settings";

export default function SettingsForm({
  heroImages,
  banners,
}: {
  heroImages: string[];
  banners: PromoBanner[];
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
          style={{ borderColor: "#9A4A3C", color: "#9A4A3C" }}
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
          <PhotoUploader name="heroImages" initial={heroImages} />
        </div>
      </div>

      <div className="rule mt-8 pt-6">
        <label className="block text-sm font-medium">Promo banners</label>
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Shown further down the home page. Two or three works best.
        </p>
        <div className="mt-3">
          <BannerEditor name="banners" initial={banners} />
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
