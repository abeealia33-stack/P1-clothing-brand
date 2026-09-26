import Link from "next/link";
import type { HeroFocus, HeroPosition } from "@/lib/hero";
import { site } from "@/lib/site";

const FOCUS: Record<HeroFocus, string> = {
  top: "50% 15%",
  center: "50% 50%",
  bottom: "50% 85%",
};

const POSITION: Record<HeroPosition, string> = {
  center: "justify-center",
  left: "justify-start",
};

/**
 * The top of the home page: a photograph and one button. The words live in
 * the alt text and a hidden heading, so search engines and screen readers
 * still get the tagline the eye no longer has to read.
 *
 * A <picture> rather than a slideshow component: the phone gets its own
 * portrait crop when one is uploaded, and only the photo that will be shown
 * is downloaded.
 */
export default function HeroBanner({
  desktopImage,
  mobileImage,
  buttonLabel,
  href,
  position,
  focus,
}: {
  desktopImage: string;
  mobileImage: string;
  buttonLabel: string;
  href: string;
  position: HeroPosition;
  focus: HeroFocus;
}) {
  const alt = `${site.name} — ${site.tagline}`;

  return (
    <section className="fold-hero -mt-14 md:-mt-16">
      <h1 className="sr-only">{alt}</h1>

      <div className="absolute inset-0 overflow-hidden">
        <div className="fold-parallax relative h-full w-full origin-center">
          <picture>
            {mobileImage && <source media="(max-width: 767px)" srcSet={mobileImage} />}
            <img
              src={desktopImage}
              alt={alt}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              className="block h-full w-full object-cover"
              style={{
                objectPosition: FOCUS[focus],
                backgroundColor: "var(--color-khaddar)",
              }}
            />
          </picture>
        </div>
      </div>

      {/* Just enough shade behind the button to keep it legible on a pale photo. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,.12), rgba(0,0,0,0))" }}
      />

      {/* On a phone the fixed tab bar covers the bottom, so the button sits
          its 32px above that rather than above the screen edge. */}
      <div
        className={`hero-cta absolute inset-x-0 bottom-[calc(var(--spacing-tabbar)+2rem)] mx-auto flex max-w-7xl px-5 md:px-16 md:bottom-8 ${POSITION[position]}`}
      >
        <Link href={href} className="hero-button">
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
