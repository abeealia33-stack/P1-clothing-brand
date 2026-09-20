"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ClothImage from "./ClothImage";
import type { ShownTile } from "@/lib/banners";

/** How long each tile holds before the strip steps along by one. */
const AUTOPLAY_MS = 4000;

/* eslint-disable react-hooks/exhaustive-deps -- goTo reads the rail through
   a ref, so it is stable in every way that matters here; listing it would
   restart the timer on each render and the carousel would never advance. */

/**
 * The tiles beside the panel: three abreast on a desktop, two and a glimpse
 * of the next on a phone, stepping along one tile every four seconds — one
 * leaves on the left as one arrives on the right.
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
  const [stop, setStop] = useState(0);
  const [stops, setStops] = useState(1);
  /* Nothing should slide out from under a pointer that is on it, or from
     under someone tabbing through the links. */
  const [held, setHeld] = useState(false);

  /**
   * One tile's worth of travel, gap included.
   *
   * The carousel moves a tile at a time, not a screenful: one leaves on the
   * left and one arrives on the right, which is what makes it read as a strip
   * being drawn past rather than pages being turned.
   */
  const step = () => {
    const el = rail.current;
    if (!el) return 0;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return el.clientWidth;
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    return first.offsetWidth + gap;
  };

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      if (el.clientWidth === 0) return;
      const travel = step();
      if (travel === 0) return;
      /* Stops, not screenfuls: how many tiles it can come to rest on before
         the last one is up against the right edge. */
      setStops(Math.max(1, Math.round((el.scrollWidth - el.clientWidth) / travel) + 1));
      setStop(Math.round(el.scrollLeft / travel));
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
    el.scrollTo({ left: next * step(), behavior: "smooth" });
  };

  useEffect(() => {
    if (held || stops < 2) return;
    // Moving on its own is the one thing that cannot ask first, so under
    // reduce it simply does not: the tiles sit still and are swiped.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      const el = rail.current;
      if (!el) return;
      const travel = step();
      if (travel === 0) return;
      const current = Math.round(el.scrollLeft / travel);
      goTo(current + 1 >= stops ? 0 : current + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [held, stops]);

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
      {/* A hairline apart, not a margin: the three photographs should read as
          one strip of cloth cut into three, which is what the gap being
          almost nothing does. */}
      <div ref={rail} className="rail gap-1.5">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className="banner-item w-[44%] md:w-[calc((100%-0.75rem)/3)]"
            style={{ "--beat": `${180 + i * 100}ms` } as React.CSSProperties}
          >
            <Link href={tile.href} className="banner-card block">
              <div className="relative aspect-[4/5] overflow-hidden">
                <div className="banner-zoom absolute inset-0">
                  <ClothImage src={tile.image} alt="" className="banner-photo" />
                </div>
              </div>
              {tile.label && (
                <h3 className="mt-5 text-center text-sm tracking-[0.18em] uppercase md:text-base">
                  {tile.label}
                </h3>
              )}
            </Link>
          </div>
        ))}
      </div>

      {stops > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: stops }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${i + 1} of ${stops}`}
              aria-current={i === stop ? "true" : undefined}
              /* The dot is small; the tap target around it is not. */
              className="flex h-8 w-8 items-center justify-center"
            >
              <span
                className="block h-1.5 w-1.5 rounded-full transition-colors"
                style={{
                  background:
                    i === stop ? "var(--color-sage-deep)" : "var(--color-line)",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
