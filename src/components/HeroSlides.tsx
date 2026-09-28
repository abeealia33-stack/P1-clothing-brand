"use client";

import { useEffect, useState } from "react";
import type { HeroFocus, HeroSlide } from "@/lib/hero";

/** Long enough to look at a photograph rather than be shown one. */
const HOLD_MS = 6000;

const FOCUS: Record<HeroFocus, string> = {
  top: "50% 15%",
  center: "50% 50%",
  bottom: "50% 85%",
};

/**
 * The hero's photographs, crossfading on a timer.
 *
 * Stacked and faded rather than slid: the button and the words sit over this,
 * and anything travelling sideways underneath them is movement asking to be
 * watched. One photograph simply sits there, with no timer running at all.
 *
 * Under prefers-reduced-motion it holds on the first — the photographs still
 * do their job, nothing just moves for its own sake.
 */
export default function HeroSlides({
  slides,
  focus,
  alt,
}: {
  slides: HeroSlide[];
  focus: HeroFocus;
  alt: string;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setShown((i) => (i + 1) % slides.length);
    }, HOLD_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <>
      {slides.map((slide, i) => (
        <picture
          key={slide.desktopImage}
          className="hero-slide"
          data-on={i === shown ? "true" : undefined}
        >
          {slide.mobileImage && (
            <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
          )}
          <img
            src={slide.desktopImage}
            /* Only the first is described: the rest are the same subject
               photographed again, not extra information to read out. */
            alt={i === 0 ? alt : ""}
            loading={i === 0 ? "eager" : "lazy"}
            decoding={i === 0 ? "sync" : "async"}
            fetchPriority={i === 0 ? "high" : "low"}
            className="block h-full w-full object-cover"
            style={{ objectPosition: FOCUS[focus] }}
          />
        </picture>
      ))}
    </>
  );
}
