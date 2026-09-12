"use client";

import Link from "next/link";
import { useActionState } from "react";
import VideoUploader from "./VideoUploader";
import {
  createReelAction,
  updateReelAction,
  type ReelFormState,
} from "@/app/admin/reels/actions";
import type { Product } from "@/lib/types";
import type { Reel } from "@/lib/reels";

export default function ReelForm({
  reel,
  products,
}: {
  reel?: Reel;
  products: Product[];
}) {
  const editing = reel !== undefined;
  const [state, action, pending] = useActionState<ReelFormState, FormData>(
    editing ? updateReelAction : createReelAction,
    {}
  );
  const errors = state.errors ?? {};

  return (
    <form action={action} className="mt-8 max-w-xl">
      {editing && <input type="hidden" name="id" value={reel.id} />}

      {errors.form && (
        <p
          role="alert"
          className="mb-6 border p-4 text-sm"
          style={{ borderColor: "var(--color-alert)", color: "var(--color-alert)" }}
        >
          {errors.form}
        </p>
      )}

      <Field id="video" label="Video" error={errors.video}>
        <VideoUploader name="video" initial={reel?.video ?? null} />
      </Field>

      <Field
        id="productId"
        label="Which piece is this?"
        hint="Tapping the reel takes shoppers straight to this piece."
        error={errors.productId}
      >
        <select
          id="productId"
          name="productId"
          defaultValue={reel?.productId ?? ""}
          className="field"
        >
          <option value="" disabled>
            Choose a piece
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="caption"
        label="Caption (optional)"
        hint="A short line shown with the video, if you want one."
      >
        <input
          id="caption"
          name="caption"
          defaultValue={reel?.caption ?? ""}
          className="field"
        />
      </Field>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="active"
          defaultChecked={reel ? reel.active : true}
          className="mt-1 h-4 w-4 accent-[var(--color-sage-deep)]"
        />
        <span>
          <span className="block text-sm font-medium">Show in the reels rail</span>
          <span className="block text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Untick to hide it without deleting the upload.
          </span>
        </span>
      </label>

      <div className="rule mt-8 flex flex-wrap gap-3 pt-6">
        <button type="submit" disabled={pending} className="btn btn-ink">
          {pending ? "Saving" : editing ? "Save changes" : "Add reel"}
        </button>
        <Link href="/admin/reels" className="btn btn-quiet">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {hint && (
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm" style={{ color: "var(--color-alert)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
