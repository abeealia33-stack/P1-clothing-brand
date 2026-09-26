"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export type ShownDay = { key: string; label: string; reason: string; products: Product[] };

/**
 * "Aaj ka din kaisa hai?" — dressing by the day you are having rather than
 * the season. One tap swaps the pieces below; nothing reloads. Chips are
 * radio buttons underneath, so a keyboard or screen reader gets the same
 * one-of-five choice the eye does.
 */
export default function DayPicker({ days }: { days: ShownDay[] }) {
  const [active, setActive] = useState(days[0].key);
  const day = days.find((d) => d.key === active) ?? days[0];

  return (
    <section className="home-section">
      <div className="mx-auto max-w-7xl px-5 md:px-16">
        <h2 className="home-h2">Aaj ka din kaisa hai?</h2>

        <div
          role="radiogroup"
          aria-label="What is your day like?"
          className="rail -mx-5 mt-6 gap-2 px-5 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        >
          {days.map((d) => {
            const on = d.key === day.key;
            return (
              <button
                key={d.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setActive(d.key)}
                className="h-10 shrink-0 rounded-full border px-4 text-sm transition-colors"
                style={{
                  borderColor: on ? "var(--color-ink)" : "var(--color-line)",
                  background: on ? "var(--color-ink)" : "transparent",
                  color: on ? "var(--color-paper)" : "var(--color-ink)",
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Keyed on the day so the new pieces arrive visibly. */}
        <div key={day.key} className="grid-in">
          {day.reason && (
            <p className="mt-5 text-sm" style={{ color: "var(--color-ink-soft)" }} aria-live="polite">
              {day.reason}
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">
            {day.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
