"use client";

import { useActionState } from "react";
import {
  saveCollectionsAction,
  type CollectionsFormState,
} from "@/app/admin/collections/actions";
import type { ResolvedCollection } from "@/lib/types";

export default function CollectionsForm({
  collections,
  counts,
}: {
  collections: ResolvedCollection[];
  counts: Record<string, number>;
}) {
  const [state, action, pending] = useActionState<CollectionsFormState, FormData>(
    saveCollectionsAction,
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

      {collections.map((collection, i) => {
        const pieces = counts[collection.slug] ?? 0;
        return (
          <fieldset
            key={collection.slug}
            className={i === 0 ? "border-0 p-0" : "rule mt-8 border-0 p-0 pt-6"}
          >
            <legend className="text-sm font-medium">
              {collection.name}{" "}
              <span style={{ color: "var(--color-ink-soft)" }}>
                — {pieces} {pieces === 1 ? "piece" : "pieces"}
              </span>
            </legend>

            <div className="mt-3 space-y-4">
              <Field
                id={`${collection.slug}.name`}
                label="Name"
                defaultValue={collection.name}
              />
              <Field
                id={`${collection.slug}.urdu`}
                label="Urdu name"
                defaultValue={collection.urdu}
                className="urdu"
              />
              <Field
                id={`${collection.slug}.line`}
                label="Short line"
                hint="Sits under the name on the home page."
                defaultValue={collection.line}
              />
              <Field
                id={`${collection.slug}.intro`}
                label="Intro"
                hint="The longer paragraph at the top of this collection's page."
                defaultValue={collection.intro}
                multiline
              />

              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  name={`${collection.slug}.inNav`}
                  defaultChecked={collection.inNav}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-sage-deep)]"
                />
                <span>
                  <span className="block text-sm">Show in the menus</span>
                  <span
                    className="block text-sm"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    Off takes it out of the shop menu and the home page. Pieces
                    filed under it are left alone, and its own page keeps
                    working for anyone holding the link.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        );
      })}

      <div className="rule mt-8 flex flex-wrap gap-3 pt-6">
        <button type="submit" disabled={pending} className="btn btn-ink">
          {pending ? "Saving" : "Save"}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  defaultValue,
  multiline = false,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  defaultValue: string;
  multiline?: boolean;
  className?: string;
}) {
  const shared = {
    id,
    name: id,
    defaultValue,
    "aria-describedby": hint ? `${id}-hint` : undefined,
    className: `field ${className ?? ""}`.trim(),
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {hint}
        </p>
      )}
      <div className="mt-2">
        {multiline ? <textarea {...shared} rows={3} /> : <input {...shared} type="text" />}
      </div>
    </div>
  );
}
