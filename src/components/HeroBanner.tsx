import Link from "next/link";
import HeroSlides from "./HeroSlides";
import type { HeroFocus, HeroPosition, HeroSlide } from "@/lib/hero";
import { site } from "@/lib/site";

const POSITION: Record<HeroPosition, string> = {
  center: "justify-center",
  left: "justify-start",
};

/**
 * The top of the home page: a photograph and one button. The words live in
 * the alt text and a hidden heading, so search engines and screen readers
 * still get the tagline the eye no longer has to read.
 *
 * Portrait artwork fills the phone hero; desktop preserves landscape artwork.
 */
export default function HeroBanner({
  slides,
  buttonLabel,
  href,
  position,
  focus,
}: {
  slides: HeroSlide[];
  buttonLabel: string;
  href: string;
  position: HeroPosition;
  focus: HeroFocus;
}) {
  const alt = `${site.name} — ${site.tagline}`;

  return (
    <section className="fold-hero md:-mt-16">
      <h1 className="sr-only">{alt}</h1>

      <div className="hero-photo absolute inset-0 overflow-hidden">
        <HeroSlides slides={slides} focus={focus} alt={alt} />
      </div>

      {/* Just enough shade behind the button to keep it legible on a pale photo. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,.35), rgba(0,0,0,0))" }}
      />

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end">
        <div
          className={`hero-cta pointer-events-auto absolute inset-x-0 ${slides.length > 1 ? "bottom-16 md:mb-16" : "bottom-8 md:mb-8"} mx-auto flex max-w-7xl px-5 md:sticky md:bottom-20 md:w-full md:px-16 ${POSITION[position]}`}
        >
          <Link href={href} className="hero-button">
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
