"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The cart count, which flicks up by a step when a piece is added. The bump
 * is the only confirmation some people wait for, so it fires on the count
 * going up and stays still when it comes back down — a removal is not
 * something to celebrate.
 */
export default function CartCount({
  count,
  className,
}: {
  count: number;
  className: string;
}) {
  const previous = useRef(count);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    const grew = count > previous.current;
    previous.current = count;
    if (!grew) return;

    setBumping(true);
    const timer = setTimeout(() => setBumping(false), 450);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <span
      className={`tnum ${className} ${bumping ? "bump" : ""}`}
      style={{ background: "var(--color-sage-deep)" }}
    >
      {count}
    </span>
  );
}
