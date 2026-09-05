"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A horizontal rail that says how far along it you are.
 *
 * A rail with no indicator hides its own contents: on a phone you see two
 * pieces and no reason to think there are four. The hairline underneath is
 * the smallest thing that fixes that, and it disappears at the width where
 * the rail becomes an ordinary grid and there is nothing left to reveal.
 */
export default function SwipeRail({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      const travel = el.scrollWidth - el.clientWidth;
      setScrollable(travel > 8);
      setProgress(travel > 0 ? el.scrollLeft / travel : 0);
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

  return (
    <>
      <div ref={rail} className={className}>
        {children}
      </div>
      {scrollable && (
        <div className="mt-4 px-5 md:hidden" aria-hidden="true">
          <div className="h-px w-full" style={{ background: "var(--color-line)" }}>
            {/* A third of the track, slid along by how far you have scrolled. */}
            <div
              className="h-px w-1/3 transition-transform duration-150 ease-out"
              style={{
                background: "var(--color-sage-deep)",
                transform: `translateX(${progress * 200}%)`,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
