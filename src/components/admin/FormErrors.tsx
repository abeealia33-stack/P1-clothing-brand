"use client";

import { useEffect, useRef } from "react";

/**
 * What went wrong, said once at the top of the form.
 *
 * The admin forms are long — the product form runs well past a screen — and
 * every field says what is wrong with it beside itself. That is the right
 * place for the detail, but it is the wrong place for the news: the Save
 * button is at the bottom, so a complaint about the name renders far above
 * the fold and the owner sees nothing happen at all when she presses it.
 *
 * So the same messages are collected here, above everything, and this box
 * takes focus the moment the form comes back rejected. Focusing scrolls it
 * into view, moves the keyboard to it, and — because it is a live alert —
 * makes a screen reader read it out. Each line links to the field it came
 * from, so a long form is one tap rather than a hunt.
 */
export default function FormErrors({
  errors,
  labels = {},
}: {
  /** Straight from the action's state, so the reference only changes on a
      new result — the effect below must not re-fire on every keystroke. */
  errors?: Record<string, string>;
  /** Field id -> what that field is called, for the "Name: ..." prefix. */
  labels?: Record<string, string>;
}) {
  const box = useRef<HTMLDivElement>(null);
  const problems = Object.entries(errors ?? {});

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) box.current?.focus();
  }, [errors]);

  if (problems.length === 0) return null;

  return (
    <div
      ref={box}
      role="alert"
      tabIndex={-1}
      className="mb-6 border p-4 outline-none"
      style={{ borderColor: "var(--color-alert)", color: "var(--color-alert)" }}
    >
      <p className="text-sm font-medium">
        {problems.length === 1
          ? "One thing needs fixing before this can be saved:"
          : `${problems.length} things need fixing before this can be saved:`}
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {problems.map(([field, message]) => (
          <li key={field}>
            {/* "form" is about the save itself, not a field, so it has
                nothing to link to. */}
            {field === "form" ? (
              message
            ) : (
              /* The wrapper, not the input: colours and photos are built from
                 several controls and have no single field to point at. */
              <a href={`#${field}-field`} className="underline underline-offset-2">
                {labels[field] ? `${labels[field]}: ${message}` : message}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
