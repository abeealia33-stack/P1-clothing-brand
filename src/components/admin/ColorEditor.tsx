"use client";

import { useState } from "react";
import type { ProductColor } from "@/lib/types";

/** The shades actually used across the catalogue, so swatches stay in family. */
const suggestions: ProductColor[] = [
  { name: "Undyed", hex: "#E4DCCF" },
  { name: "Chalk", hex: "#EDE7DD" },
  { name: "Fog", hex: "#CFCCC4" },
  { name: "Wheat", hex: "#D8C7A6" },
  { name: "Tea", hex: "#B9A489" },
  { name: "Clay", hex: "#A98D77" },
  { name: "Chai", hex: "#9C7F63" },
  { name: "Sage", hex: "#8B9E8B" },
  { name: "Charcoal", hex: "#3A3A3A" },
];

/**
 * Colours are a name plus a swatch, so the shop can show a dot the customer
 * recognises. Picking from the shades already in use is one tap; anything else
 * is a name and a colour picker, no hex codes to memorise.
 */
export default function ColorEditor({
  name,
  initial,
}: {
  name: string;
  initial: ProductColor[];
}) {
  const [colors, setColors] = useState<ProductColor[]>(initial);
  const [label, setLabel] = useState("");
  const [hex, setHex] = useState("#8B9E8B");

  const add = (colour: ProductColor) => {
    const clean = colour.name.trim();
    if (!clean) return;
    setColors((prev) =>
      prev.some((c) => c.name.toLowerCase() === clean.toLowerCase())
        ? prev
        : [...prev, { name: clean, hex: colour.hex }]
    );
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(colors)} />

      {colors.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {colors.map((colour, i) => (
            <li
              key={colour.name}
              className="flex items-center gap-2 border py-1 pr-1 pl-2"
              style={{ borderColor: "var(--color-line)" }}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{
                  background: colour.hex,
                  boxShadow: "inset 0 0 0 1px rgba(44,44,44,.15)",
                }}
              />
              <span className="text-sm">{colour.name}</span>
              <button
                type="button"
                onClick={() => setColors((prev) => prev.filter((_, j) => j !== i))}
                aria-label={`Remove ${colour.name}`}
                className="h-7 w-7 text-sm"
                style={{ color: "var(--color-ink-soft)" }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Colour name"
          aria-label="New colour name"
          className="field"
          style={{ width: "12rem" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add({ name: label, hex });
              setLabel("");
            }
          }}
        />
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          aria-label="New colour swatch"
          className="h-12 w-14 cursor-pointer border"
          style={{ borderColor: "var(--color-line)" }}
        />
        <button
          type="button"
          onClick={() => {
            add({ name: label, hex });
            setLabel("");
          }}
          className="btn btn-quiet"
        >
          Add colour
        </button>
      </div>

      <p className="mt-3 text-xs" style={{ color: "var(--color-ink-soft)" }}>
        Or tap one you have used before
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {suggestions
          .filter((s) => !colors.some((c) => c.name === s.name))
          .map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => add(s)}
              className="flex items-center gap-1.5 border px-2 py-1 text-xs"
              style={{ borderColor: "var(--color-line)" }}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  background: s.hex,
                  boxShadow: "inset 0 0 0 1px rgba(44,44,44,.15)",
                }}
              />
              {s.name}
            </button>
          ))}
      </div>
    </div>
  );
}
