"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ClothImage from "./ClothImage";
import type { ShownTile } from "@/lib/banners";

/** How long each page of tiles holds before the next slides in. */
const AUTOPLAY_MS = 4000;

/**
 * The tiles beside the panel: three abreast on a desktop, two and a glimpse
 * of the next on a phone, moving on by themselves every four seconds.
 *
 * Built on the rail the rest of the site uses — a scroll-snapping strip —
 * rather than a track pushed about by script. That keeps the thing a phone
 * is best at: you can take hold of it and flick it, with the momentum and
 * the snap the operating system gives for free, and the dots follow along
 * whether it moved by finger or by timer.
 *
 * It rewinds at the end rather than looping seamlessly. A seamless loop
 * needs cloned tiles either side and the scroll position jumped between
 * them, which fights the native scrolling above; the wind-back is calmer
 * than the fight would be worth.
 */
export default function TileCarousel({ tiles }: { tiles: ShownTile[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  /* Nothing should slide out from under a pointer that is on it, or from
     under someone tabbing through the links. */
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      if (el.clientWidth === 0) return;
      setPages(Math.max(1, Math.round(el.scrollWidth / el.clientWidth)));
      setPage(Math.round(el.scrollLeft / el.clientWidth));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (next: number) => {
    const el = rail.current;
    if (!el) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (held || pages < 2) return;
    // Moving on its own is the one thing that cannot ask first, so under
    // reduce it simply does not: the tiles sit still and are swiped.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      const el = rail.current;
      if (!el) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      goTo(current + 1 >= pages ? 0 : current + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [held, pages]);

  return (
    <div
      className="banner-grid"
      /* A touch already stops it by scrolling, so only a real pointer
         hovering counts — otherwise one tap would pause it for good. */
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <div ref={rail} className="rail gap-4">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className="banner-item w-[42%] md:w-[calc((100%-2rem)/3)]"
            style={{ "--beat": `${180 + i * 100}ms` } as React.CSSProperties}
          >
            <Link href={tile.href} className="banner-card block">
              <div className="relative aspect-[3/4] overflow-hidden">
                <div className="banner-zoom absolute inset-0">
                  <ClothImage src={tile.image} alt="" className="banner-photo" />
                </div>
              </div>
              {tile.label && (
                <h3 className="mt-3 text-center text-xs tracking-[0.14em] uppercase md:text-sm">
                  {tile.label}
                </h3>
              )}
            </Link>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${i + 1} of ${pages}`}
              aria-current={i === page ? "true" : undefined}
              /* The dot is small; the tap target around it is not. */
              className="flex h-8 w-8 items-center justify-center"
            >
              <span
                className="block h-1.5 w-1.5 rounded-full transition-colors"
                style={{
                  background:
                    i === page ? "var(--color-sage-deep)" : "var(--color-line)",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
