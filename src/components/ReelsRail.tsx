"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/reels";

/**
 * The reels strip on the home page: tall video cards you scroll through
 * sideways, each opening the piece it shows when tapped.
 *
 * Only the video nearest the centre of the rail plays — the rest sit on their
 * poster frame — so scrolling past a dozen clips never asks a phone to decode
 * a dozen videos at once. An IntersectionObserver decides which one that is;
 * arrows on desktop and swipe on touch both just scroll the same track.
 */
export default function ReelsRail({ reels }: { reels: Reel[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(reels[0]?.id ?? null);
  /* Arrows only earn their place when there is somewhere to scroll to, so the
     rail reports whether it overflows and where it currently sits. */
  const [edges, setEdges] = useState({ scrollable: false, atStart: true, atEnd: false });

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(best.target.getAttribute("data-reel-id"));
      },
      { root: el, threshold: [0.6, 0.75, 0.9] }
    );

    el.querySelectorAll("[data-reel-id]").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [reels]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    const measure = () => {
      const slack = el.scrollWidth - el.clientWidth;
      // The rail is padded and snap-aligned, so a rail sitting at its start
      // reports scrollLeft equal to that padding rather than zero. Measure
      // against where the first card actually begins.
      const first = el.firstElementChild as HTMLElement | null;
      const origin = first ? first.offsetLeft : 0;
      setEdges({
        scrollable: slack > 4,
        atStart: el.scrollLeft <= origin + 4,
        atEnd: el.scrollLeft >= slack - 4,
      });
    };

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [reels]);

  const scrollBy = (dir: 1 | -1) => {
    rail.current?.scrollBy({ left: dir * 440, behavior: "smooth" });
  };

  if (reels.length === 0) return null;

  return (
    <div className="relative">
      <div ref={rail} className="rail gap-4 px-5 md:mx-auto md:max-w-6xl">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} playing={active === reel.id} />
        ))}
      </div>

      {/* Arrows are a pointer-only convenience — touch already swipes. They
          track the rail's own width rather than the viewport's, so they sit
          against the cards instead of drifting off to the window edges. */}
      {edges.scrollable && (
        <div className="pointer-events-none absolute inset-0 mx-auto hidden max-w-6xl items-center justify-between px-1 md:flex">
          <Arrow
            direction="back"
            disabled={edges.atStart}
            onClick={() => scrollBy(-1)}
          />
          <Arrow
            direction="forward"
            disabled={edges.atEnd}
            onClick={() => scrollBy(1)}
          />
        </div>
      )}
    </div>
  );
}

function Arrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "back" | "forward";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "back" ? "Show earlier reels" : "Show more reels"}
      className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full text-xl transition-opacity disabled:opacity-0"
      style={{
        background: "rgba(245,240,235,.94)",
        color: "var(--color-ink)",
        boxShadow: "0 2px 10px -4px rgba(44,44,44,.5)",
      }}
    >
      {direction === "back" ? "‹" : "›"}
    </button>
  );
}

function ReelCard({ reel, playing }: { reel: Reel; playing: boolean }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (playing) {
      el.play().catch(() => {
        // Autoplay can be refused before any user gesture; the poster frame
        // still shows, so nothing looks broken.
      });
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [playing]);

  return (
    <Link
      href={`/product/${reel.productSlug}`}
      data-reel-id={reel.id}
      className="lift relative block aspect-[9/16] w-44 shrink-0 overflow-hidden sm:w-52"
    >
      <video
        ref={video}
        src={reel.video}
        poster={reel.poster ?? undefined}
        muted
        loop
        playsInline
        preload={playing ? "auto" : "metadata"}
        className="h-full w-full object-cover"
      />
      <div
        className="absolute inset-x-0 bottom-0 p-3"
        style={{
          background:
            "linear-gradient(to top, rgba(30,28,25,.78) 0%, rgba(30,28,25,0) 65%)",
        }}
      >
        <p className="truncate text-sm text-white">
          {reel.caption || reel.productName}
        </p>
      </div>
    </Link>
  );
}
