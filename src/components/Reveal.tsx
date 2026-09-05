"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades and lifts its children in the first time they scroll into view, then
 * leaves them alone — a one-shot entrance rather than the ambient motion
 * elsewhere on the site (see .centre-scale in globals.css, which oscillates
 * on purpose). Stands down entirely under prefers-reduced-motion.
 */
export default function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
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
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
