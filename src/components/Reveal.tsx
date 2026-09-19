"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades and lifts its children in the first time they scroll into view, then
 * leaves them alone — a one-shot entrance rather than the ambient motion
 * elsewhere on the site (see .centre-scale in globals.css, which oscillates
 * on purpose). Stands down entirely under prefers-reduced-motion.
 *
 * A section that choreographs its own entrance — the home page banners, where
 * each card arrives on its own beat — passes `lift={false}`: this then only
 * says when the section is on screen, with `is-visible`, and moves nothing
 * itself. Those sections also say how much of them must be showing, because
 * a tall section at the default would start its entrance too late to be seen.
 */
export default function Reveal({
  children,
  className = "",
  lift = true,
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
}: {
  children: ReactNode;
  className?: string;
  /** False to only mark the moment it is on screen, and animate nothing. */
  lift?: boolean;
  /** How much of it must be on screen, from 0 to 1. */
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* No reduced-motion branch is needed here: the .reveal rules live inside
       a `prefers-reduced-motion: no-preference` block, so under reduce the
       children are visible whatever this class says. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className={`${lift ? "reveal" : ""} ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
