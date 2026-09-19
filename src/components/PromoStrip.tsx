import Link from "next/link";
import ClothImage from "./ClothImage";
import Reveal from "./Reveal";
import SwipeRail from "./SwipeRail";
import type { ShownSlot } from "@/lib/banners";

/** When each card starts, after the section comes on screen. */
const BEATS = ["180ms", "280ms", "380ms"];

/**
 * Three tall photographs under one heading — the owner's current promotions.
 *
 * The entrance is set out in globals.css under "The home page banners": the
 * heading rises first, then each card on its own beat, arriving slightly dull
 * and settling into colour while its photograph eases back from 108%.
 *
 * Three abreast on a phone would be three slivers, so there it swipes like
 * "Just in" does, and becomes a row of three once there is room.
 */
export default function PromoStrip({
  heading,
  cards,
}: {
  heading: string;
  cards: ShownSlot[];
}) {
  return (
    <section className="py-12 md:py-16">
      <Reveal lift={false} threshold={0.12} rootMargin="0px">
        <h2 className="banner-heading mx-auto max-w-6xl px-5 text-4xl md:text-5xl">
          {heading}
        </h2>

        {/* The vertical padding is room for the resting shadow and the lift:
            the rail scrolls sideways, which clips anything past its edges. */}
        <SwipeRail className="banner-grid rail mt-8 gap-4 px-5 py-3 md:mx-auto md:grid md:max-w-6xl md:grid-cols-3 md:gap-5 md:overflow-visible">
          {cards.map((card, i) => (
            <div
              key={i}
              className="banner-item w-[72vw] max-w-80 md:w-auto md:max-w-none"
              style={{ "--beat": BEATS[i] } as React.CSSProperties}
            >
              <Link
                href={card.href}
                className="banner-card banner-lifts relative block aspect-[3/4] overflow-hidden"
              >
                <div className="banner-zoom absolute inset-0">
                  <ClothImage src={card.image} alt="" className="banner-photo" />
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 h-1/2"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(28,26,23,.62) 0%, rgba(28,26,23,0) 100%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  {card.heading && (
                    <h3 className="text-2xl leading-tight text-white md:text-3xl">
                      {card.heading}
                    </h3>
                  )}
                  <span className="banner-cta mt-3 inline-block">
                    <span
                      className="banner-button btn"
                      style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
                    >
                      {card.buttonLabel}
                    </span>
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </SwipeRail>
      </Reveal>
    </section>
  );
}
