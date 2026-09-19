import Link from "next/link";
import Reveal from "./Reveal";
import TileCarousel from "./TileCarousel";
import type { ShownStrip } from "@/lib/banners";

/**
 * A panel of words with a carousel of ranges beside it — the way a lookbook
 * lays out its contents: one column saying what this is, the rest of the
 * spread showing it.
 *
 * The panel sits above the tiles on a phone, where there is no room beside
 * them, and the tiles keep their own scrolling.
 *
 * The entrance is set out in globals.css under "The home page banners": the
 * panel rises first, then each tile on its own beat, arriving slightly dull
 * and settling into colour while its photograph eases back from 108%.
 */
export default function PromoStrip({ strip }: { strip: ShownStrip }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <Reveal lift={false} threshold={0.12} rootMargin="0px">
        <div className="grid gap-8 md:grid-cols-[20rem_minmax(0,1fr)] md:items-center md:gap-12">
          <div className="banner-heading">
            {strip.eyebrow && (
              <span
                className="block text-xs tracking-[0.18em] uppercase"
                style={{ color: "var(--color-sage-deep)" }}
              >
                {strip.eyebrow}
              </span>
            )}
            <h2 className="mt-2 text-4xl md:text-5xl">{strip.heading}</h2>
            {strip.text && (
              <p className="measure mt-3 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                {strip.text}
              </p>
            )}
            <span className="banner-cta mt-6 inline-block">
              <Link href={strip.href} className="btn btn-ink">
                {strip.buttonLabel}
              </Link>
            </span>
          </div>

          <TileCarousel tiles={strip.tiles} />
        </div>
      </Reveal>
    </section>
  );
}
