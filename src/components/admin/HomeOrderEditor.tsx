"use client";

import { homeBlockLabels, type HomeBlock } from "@/lib/banners";

/**
 * The order of the home page, as a list you move things up and down in.
 *
 * Arrows rather than dragging: this is a handful of rows, dragging needs a pointer
 * that can hold something steady, and the owner is as likely to be doing
 * this on a phone as at a desk.
 */
export default function HomeOrderEditor({
  order,
  newInHeading = homeBlockLabels.newIn,
  onChange,
}: {
  order: HomeBlock[];
  newInHeading?: string;
  onChange: (order: HomeBlock[]) => void;
}) {
  const labels = { ...homeBlockLabels, newIn: newInHeading.trim() || homeBlockLabels.newIn };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [taken] = next.splice(from, 1);
    next.splice(to, 0, taken);
    onChange(next);
  };

  return (
    <ol className="mt-3 border" style={{ borderColor: "var(--color-line)" }}>
      {order.map((block, i) => (
        <li
          key={block}
          className={`flex items-center justify-between gap-3 px-3 py-2 ${i > 0 ? "border-t" : ""}`}
          style={{ borderColor: "var(--color-line)" }}
        >
          <span className="min-w-0 text-sm [overflow-wrap:anywhere]">
            <span className="tnum mr-2" style={{ color: "var(--color-ink-soft)" }}>
              {i + 1}
            </span>
            {labels[block]}
          </span>
          <span className="flex shrink-0">
            <button
              type="button"
              onClick={() => move(i, i - 1)}
              disabled={i === 0}
              aria-label={`Move ${labels[block]} up`}
              className="h-9 w-9 text-sm disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, i + 1)}
              disabled={i === order.length - 1}
              aria-label={`Move ${labels[block]} down`}
              className="h-9 w-9 text-sm disabled:opacity-30"
            >
              ↓
            </button>
          </span>
        </li>
      ))}
    </ol>
  );
}
