"use client";

import { useEffect, useRef, useState } from "react";
import ClothImage from "./ClothImage";

/**
 * A swipeable gallery built on CSS scroll snapping — the browser does the
 * gesture, the drag physics and the momentum. The only JavaScript here reads
 * back which image has settled, so the dots can say where you are.
 */
export default function Gallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setIndex(Math.round(el.scrollLeft / el.clientWidth));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (i: number) => {
    const el = rail.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div ref={rail} className="rail aspect-[3/4] w-full">
        {photos.map((photo, i) => (
          <div key={photo} className="h-full w-full">
            <ClothImage
              src={photo}
              alt={i === 0 ? alt : `${alt}, view ${i + 1}`}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-1 flex justify-center">
          {photos.map((photo, i) => (
            <button
              key={photo}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1} of ${photos.length}`}
              aria-current={i === index ? "true" : undefined}
              className="flex h-11 w-11 items-center justify-center"
            >
              {/* The current dot stretches into a short bar: which image you
                  are on reads without counting dots. */}
              <span
                className="block h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: i === index ? "1.125rem" : "0.5rem",
                  background: i === index ? "var(--color-ink)" : "rgba(44,44,44,.3)",
                  boxShadow: "0 0 0 3px rgba(245,240,235,.7)",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
