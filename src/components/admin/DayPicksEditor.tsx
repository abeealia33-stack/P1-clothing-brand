"use client";

import { DAY_PIECES, dayKeys, dayLabels, type DayKey, type DayPick } from "@/lib/banners";
import type { ProductChoice } from "@/lib/catalogue";

/**
 * The pieces for each day of "Aaj ka din kaisa hai?", and the one line that
 * says why they suit it. A day with no pieces is left out of the home page.
 */
export default function DayPicksEditor({
  days,
  onChange,
  products,
}: {
  days: Record<DayKey, DayPick>;
  onChange: (days: Record<DayKey, DayPick>) => void;
  products: ProductChoice[];
}) {
  const setDay = (key: DayKey, patch: Partial<DayPick>) =>
    onChange({ ...days, [key]: { ...days[key], ...patch } });

  const setPiece = (key: DayKey, slot: number, id: string) => {
    const ids = Array.from({ length: DAY_PIECES }, (_, i) => days[key].productIds[i] ?? "");
    ids[slot] = id;
    setDay(key, { productIds: ids.filter(Boolean) });
  };

  return (
    <div className="mt-5 space-y-4">
      {dayKeys.map((key) => {
        const day = days[key];
        return (
          <div key={key} className="border p-4" style={{ borderColor: "var(--color-line)" }}>
            <p className="text-sm font-medium">
              {dayLabels[key]}{" "}
              <span style={{ color: "var(--color-ink-soft)" }}>
                — {day.productIds.length === 0 ? "hidden until a piece is chosen" : `${day.productIds.length} of ${DAY_PIECES}`}
              </span>
            </p>

            <label className="mt-3 block text-sm" htmlFor={`day-${key}-reason`}>
              Why these suit it (one line)
            </label>
            <input
              id={`day-${key}-reason`}
              value={day.reason}
              onChange={(e) => setDay(key, { reason: e.target.value })}
              placeholder="Breathable lawn, no ironing, decent for guests."
              className="field mt-1"
            />

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {Array.from({ length: DAY_PIECES }, (_, slot) => (
                <select
                  key={slot}
                  aria-label={`${dayLabels[key]}, piece ${slot + 1}`}
                  value={day.productIds[slot] ?? ""}
                  onChange={(e) => setPiece(key, slot, e.target.value)}
                  className="field"
                  disabled={slot > day.productIds.length}
                >
                  <option value="">{slot === 0 ? "Choose a piece" : "Add a piece"}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
