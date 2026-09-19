"use client";

import { useActionState, useState } from "react";
import BannerLinkPicker from "./BannerLinkPicker";
import BannerSlotEditor from "./BannerSlotEditor";
import BannerTileEditor from "./BannerTileEditor";
import FormErrors from "./FormErrors";
import HomeOrderEditor from "./HomeOrderEditor";
import { saveBannersAction, type BannersFormState } from "@/app/admin/banners/actions";
import {
  MAX_TILES,
  MIN_TILES,
  type BannerSlot,
  type BannerTile,
  type HomeBanners,
} from "@/lib/banners";
import type { ProductChoice } from "@/lib/catalogue";
import type { ResolvedCollection } from "@/lib/types";

/**
 * Whether a section will be on the home page once saved, in words.
 *
 * The home page holds a section back until it has enough photographs, so
 * without this a carousel two tiles short would save cleanly and then simply
 * not appear — the same silence that made a product look like it would not
 * save.
 */
function Status({ text, ready }: { text: string; ready: boolean }) {
  return (
    <p
      className="mt-1 text-sm"
      style={{ color: ready ? "var(--color-sage-deep)" : "var(--color-alert)" }}
    >
      {text}
    </p>
  );
}

function stripStatus(banners: HomeBanners) {
  if (!banners.strip.show) return { text: "Switched off — not on the home page.", ready: false };
  const withPhotos = banners.strip.tiles.filter((t) => t.image).length;
  if (withPhotos < MIN_TILES) {
    const short = MIN_TILES - withPhotos;
    return {
      text: `Not on the home page yet — ${short} more ${short === 1 ? "tile needs" : "tiles need"} a photo.`,
      ready: false,
    };
  }
  return { text: `${withPhotos} tiles ready — shows on the home page.`, ready: true };
}

function splitStatus(banners: HomeBanners) {
  if (!banners.split.show) return { text: "Switched off — not on the home page.", ready: false };
  const missing = banners.split.panels.filter((p) => !p.image).length;
  if (missing > 0) {
    return {
      text: `Not on the home page yet — add ${missing} more ${missing === 1 ? "photo" : "photos"}.`,
      ready: false,
    };
  }
  return { text: "Both photos in — shows on the home page.", ready: true };
}

export default function BannersForm({
  initial,
  collections,
  products,
}: {
  initial: HomeBanners;
  collections: ResolvedCollection[];
  products: ProductChoice[];
}) {
  const [state, action, pending] = useActionState<BannersFormState, FormData>(
    saveBannersAction,
    {}
  );
  const [banners, setBanners] = useState(initial);
  // Uploads still running. Saving now would store the section without them.
  const [busy, setBusy] = useState(0);
  const onBusyChange = (started: boolean) => setBusy((n) => n + (started ? 1 : -1));

  const setStrip = (patch: Partial<HomeBanners["strip"]>) =>
    setBanners((b) => ({ ...b, strip: { ...b.strip, ...patch } }));

  const setTile = (index: number, tile: BannerTile) =>
    setStrip({ tiles: banners.strip.tiles.map((t, i) => (i === index ? tile : t)) });

  const moveTile = (from: number, to: number) => {
    if (to < 0 || to >= banners.strip.tiles.length) return;
    const tiles = [...banners.strip.tiles];
    const [taken] = tiles.splice(from, 1);
    tiles.splice(to, 0, taken);
    setStrip({ tiles });
  };

  const setPanel = (index: number, slot: BannerSlot) =>
    setBanners((b) => ({
      ...b,
      split: { ...b.split, panels: b.split.panels.map((p, i) => (i === index ? slot : p)) },
    }));

  const strip = stripStatus(banners);
  const split = splitStatus(banners);

  return (
    <form action={action} className="mt-8 max-w-3xl">
      <input type="hidden" name="banners" value={JSON.stringify(banners)} />
      <FormErrors errors={state.errors} />

      <fieldset className="border-0 p-0">
        <legend className="text-2xl">Order on the home page</legend>
        <p className="measure mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Top to bottom, under the opening lines. A section with nothing in it
          is skipped rather than leaving a gap, so an empty one can sit
          anywhere until you fill it.
        </p>
        <HomeOrderEditor
          order={banners.order}
          onChange={(order) => setBanners((b) => ({ ...b, order }))}
        />
      </fieldset>

      <fieldset className="rule mt-10 border-0 p-0 pt-8">
        <legend className="text-2xl">The carousel</legend>
        <p className="measure mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          A panel of words with a row of photos beside it, under &ldquo;Just
          in&rdquo;. The photos move along by themselves — three at a time on a
          computer, two on a phone. It appears once {MIN_TILES} tiles have photos.
        </p>
        <Status {...strip} />

        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={banners.strip.show}
            onChange={(e) => setStrip({ show: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-sage-deep)]"
          />
          <span className="text-sm">Show on the home page</span>
        </label>

        <div className="mt-5 space-y-3 border p-4" style={{ borderColor: "var(--color-line)" }}>
          <p className="text-sm font-medium">The panel beside the photos</p>

          <div>
            <label htmlFor="strip-eyebrow" className="block text-sm font-medium">
              Small line above (optional)
            </label>
            <input
              id="strip-eyebrow"
              value={banners.strip.eyebrow}
              onChange={(e) => setStrip({ eyebrow: e.target.value })}
              placeholder="New this week"
              className="field mt-1"
            />
          </div>

          <div>
            <label htmlFor="strip-heading" className="block text-sm font-medium">
              Heading
            </label>
            <input
              id="strip-heading"
              value={banners.strip.heading}
              onChange={(e) => setStrip({ heading: e.target.value })}
              className="field mt-1"
            />
          </div>

          <div>
            <label htmlFor="strip-text" className="block text-sm font-medium">
              A line or two under it (optional)
            </label>
            <textarea
              id="strip-text"
              rows={3}
              value={banners.strip.text}
              onChange={(e) => setStrip({ text: e.target.value })}
              placeholder="Cotton and lawn cut loose, sewn properly, ready for the week."
              className="field mt-1"
            />
          </div>

          <div>
            <label htmlFor="strip-button" className="block text-sm font-medium">
              Button text
            </label>
            <input
              id="strip-button"
              value={banners.strip.buttonLabel}
              onChange={(e) => setStrip({ buttonLabel: e.target.value })}
              className="field mt-1"
            />
          </div>

          <BannerLinkPicker
            label="Where the button goes"
            link={banners.strip.link}
            onChange={(link) => setStrip({ link })}
            collections={collections}
            products={products}
          />
        </div>

        <div className="mt-5 space-y-4">
          {banners.strip.tiles.map((tile, i) => (
            <BannerTileEditor
              key={i}
              position={i}
              total={banners.strip.tiles.length}
              tile={tile}
              onChange={(next) => setTile(i, next)}
              onMove={(to) => moveTile(i, to)}
              onRemove={() =>
                setStrip({ tiles: banners.strip.tiles.filter((_, j) => j !== i) })
              }
              onBusyChange={onBusyChange}
              collections={collections}
              products={products}
            />
          ))}
        </div>

        {banners.strip.tiles.length < MAX_TILES ? (
          <button
            type="button"
            onClick={() =>
              setStrip({
                tiles: [...banners.strip.tiles, { image: "", label: "", link: { kind: "shop" } }],
              })
            }
            className="btn btn-quiet mt-4"
          >
            Add a tile
          </button>
        ) : (
          <p className="mt-4 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            {MAX_TILES} tiles is as many as the carousel shows.
          </p>
        )}
      </fieldset>

      <fieldset className="rule mt-10 border-0 p-0 pt-8">
        <legend className="text-2xl">The pair</legend>
        <p className="measure mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Two photos side by side on a dark band, under the collections. The
          left one&rsquo;s words sit on the left, the right one&rsquo;s on the
          right. It appears once both have a photo.
        </p>
        <Status {...split} />

        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={banners.split.show}
            onChange={(e) =>
              setBanners((b) => ({ ...b, split: { ...b.split, show: e.target.checked } }))
            }
            className="h-4 w-4 accent-[var(--color-sage-deep)]"
          />
          <span className="text-sm">Show on the home page</span>
        </label>

        <div className="mt-5 space-y-4">
          {banners.split.panels.map((panel, i) => (
            <BannerSlotEditor
              key={i}
              label={i === 0 ? "Left photo" : "Right photo"}
              slot={panel}
              onChange={(slot) => setPanel(i, slot)}
              onBusyChange={onBusyChange}
              collections={collections}
              products={products}
            />
          ))}
        </div>
      </fieldset>

      <div className="rule mt-10 flex flex-wrap items-center gap-3 pt-6">
        <button type="submit" disabled={pending || busy > 0} className="btn btn-ink">
          {pending ? "Saving" : busy > 0 ? "Waiting for photos" : "Save"}
        </button>
      </div>
    </form>
  );
}
