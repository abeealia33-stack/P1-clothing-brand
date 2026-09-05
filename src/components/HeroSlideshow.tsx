"use client";

import { useEffect, useState } from "react";
import ClothImage from "./ClothImage";

const INTERVAL_MS = 5000;

/**
 * The home page hero. One image just sits there; more than one cross-fades
 * on a timer. Built as stacked, absolutely-positioned images rather than a
 * carousel library — there is no dragging or dots to manage, only a slow
 * change no one is meant to consciously notice.
 *
 * Respects prefers-reduced-motion by holding on the first image instead of
 * cycling — the images still do their job, nothing just moves for its own sake.
 */
export default function HeroSlideshow({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length <= 1) {
    return <ClothImage src={images[0]} alt={alt} priority />;
  }

  return (
    <>
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i === index ? undefined : true}
        >
          <ClothImage src={src} alt={i === index ? alt : ""} priority={i === 0} />
        </div>
      ))}
    </>
  );
}
