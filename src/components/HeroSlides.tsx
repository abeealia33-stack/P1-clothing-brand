"use client";

import { useSyncExternalStore } from "react";
import { A11y, Autoplay, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { heroImageUrl, type HeroFocus, type HeroSlide } from "@/lib/hero";

const HOLD_MS = 10000;
const TRANSITION_MS = 1000;
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const readReducedMotion = () => window.matchMedia(MOTION_QUERY).matches;
const reducedMotionOnServer = () => true;

const FOCUS: Record<HeroFocus, string> = {
  top: "50% 15%",
  center: "50% 50%",
  bottom: "50% 85%",
};

/**
 * Matches the reference's horizontal Swiper transition. Reduced motion and
 * server rendering hold the first picture, which also keeps the hero visible
 * before hydration without downloading every slide.
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
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    readReducedMotion,
    reducedMotionOnServer,
  );

  const photo = (slide: HeroSlide, index: number) => (
    <picture className="block h-full w-full">
      {slide.mobileImage && (
        <source media="(max-width: 767px)" srcSet={heroImageUrl(slide.mobileImage, "mobile")} />
      )}
      <img
        src={heroImageUrl(slide.desktopImage, "desktop")}
        alt={index === 0 ? alt : ""}
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={index === 0 ? "high" : "low"}
        className="block h-full w-full object-cover md:object-contain"
        style={{ objectPosition: FOCUS[focus] }}
      />
    </picture>
  );

  if (slides.length < 2 || reducedMotion) {
    return slides[0] ? photo(slides[0], 0) : null;
  }

  return (
    <Swiper
      className="hero-swiper"
      modules={[A11y, Autoplay, Keyboard, Pagination]}
      effect="slide"
      speed={TRANSITION_MS}
      slidesPerView={1}
      spaceBetween={0}
      loop
      autoplay={{ delay: HOLD_MS, disableOnInteraction: false, waitForTransition: true }}
      keyboard={{ enabled: true, onlyInViewport: true }}
      pagination={{
        clickable: true,
        renderBullet: (index, className) =>
          `<button type="button" class="${className} hero-pagination-hit" aria-label="Show photo ${index + 1}"></button>`,
      }}
      a11y={{
        containerMessage: "Home banner photos",
        slideLabelMessage: "Photo {{index}} of {{slidesLength}}",
        paginationBulletMessage: "Show photo {{index}}",
      }}
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={`${index}-${slide.desktopImage}`}>
          {photo(slide, index)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
