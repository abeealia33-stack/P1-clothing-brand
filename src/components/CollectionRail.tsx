"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import ClothImage from "./ClothImage";
import type { ResolvedCollection } from "@/lib/types";

/**
 * The collection cards grow as they reach the middle of the screen.
 *
 * Browsers with scroll-driven CSS animations do the whole thing in
 * `centre-scale` without any help. This observer exists only for the ones that
 * do not — it toggles `.is-near` when a card enters the middle third of the
 * viewport, which lands on the same transform. Both paths sit behind
 * prefers-reduced-motion in the stylesheet.
 */
function useCentreScale() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>(".centre-scale"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-near", entry.isIntersecting);
        }
      },
      { rootMargin: "-34% 0px -34% 0px", threshold: 0 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return root;
}

export default function CollectionRail({
  collections,
}: {
  collections: ResolvedCollection[];
}) {
  const root = useCentreScale();

  return (
    <div ref={root} className="space-y-5 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
      {collections.map((c) => (
        <Link
          key={c.slug}
          href={`/shop?collection=${c.slug}`}
          className="centre-scale group relative block aspect-[4/5] overflow-hidden sm:aspect-[16/10] md:aspect-[4/5]"
        >
          <ClothImage
            src={`/cloth/collection-${c.slug}.svg`}
            alt=""
            className="transition-transform duration-700 group-hover:scale-[1.03]"
          />
          {/* The cover art already darkens toward its foot, so this is a light
              touch on top rather than a slab over the whole image. */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background:
                "linear-gradient(to top, rgba(28,26,23,.5) 0%, rgba(28,26,23,0) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
            <div>
              <h3 className="text-4xl text-white">{c.name}</h3>
              <p className="measure mt-1.5 text-sm text-white/85">{c.line}</p>
            </div>
            {/* Urdu sits on its own edge here — a flourish, mirroring the
                script's own direction against the Latin name. */}
            <p className="urdu shrink-0 pb-0 text-2xl leading-none text-white/90" style={{ textAlign: "right" }}>
              {c.urdu}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
