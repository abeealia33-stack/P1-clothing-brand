"use client";

import { useId } from "react";
import BannerLinkPicker from "./BannerLinkPicker";
import BannerPhoto from "./BannerPhoto";
import type { BannerTile } from "@/lib/banners";
import type { ProductChoice } from "@/lib/catalogue";
import type { ResolvedCollection } from "@/lib/types";

/**
 * One tile in the carousel: a photograph, the name under it, and where it
 * goes. Order matters — it is the order they scroll past in — so each row
 * can be moved without being deleted and added again.
 */
export default function BannerTileEditor({
  position,
  total,
  tile,
  onChange,
  onMove,
  onRemove,
  onBusyChange,
  collections,
  products,
}: {
  position: number;
  total: number;
  tile: BannerTile;
  onChange: (tile: BannerTile) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
  onBusyChange: (busy: boolean) => void;
  collections: ResolvedCollection[];
  products: ProductChoice[];
}) {
  const id = useId();
  const set = (patch: Partial<BannerTile>) => onChange({ ...tile, ...patch });

  return (
    <div
      className="grid gap-4 border p-4 sm:grid-cols-[9rem_1fr]"
      style={{ borderColor: "var(--color-line)" }}
    >
      <div>
        <p className="mb-2 text-sm font-medium">Tile {position + 1}</p>
        <BannerPhoto
          image={tile.image}
          onUploaded={(image) => set({ image })}
          onBusyChange={onBusyChange}
          purpose="product"
          frame="aspect-[3/4]"
          sizeHint="1200 × 1600 px, portrait"
        />
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium" htmlFor={`${id}-label`}>
            Name under the photo
          </label>
          <input
            id={`${id}-label`}
            value={tile.label}
            onChange={(e) => set({ label: e.target.value })}
            placeholder="Lawn"
            className="field mt-1"
          />
        </div>

        <BannerLinkPicker
          link={tile.link}
          onChange={(link) => set({ link })}
          collections={collections}
          products={products}
        />

        <div className="flex items-center gap-1 pt-1">
          <button
            type="button"
            onClick={() => onMove(position - 1)}
            disabled={position === 0}
            aria-label={`Move tile ${position + 1} earlier`}
            className="h-8 w-8 text-sm disabled:opacity-30"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onMove(position + 1)}
            disabled={position === total - 1}
            aria-label={`Move tile ${position + 1} later`}
            className="h-8 w-8 text-sm disabled:opacity-30"
          >
            ›
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 text-sm underline underline-offset-2"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Remove tile
          </button>
        </div>
      </div>
    </div>
  );
}
