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
 * Phones show the complete shared photo; desktop uses the selected crop.
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

      <div className="hero-photo relative overflow-hidden md:absolute md:inset-0">
        <div className="fold-parallax relative w-full origin-center md:h-full">
          <HeroSlides slides={slides} focus={focus} alt={alt} />
        </div>
      </div>

      {/* Just enough shade behind the button to keep it legible on a pale photo. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/5 md:block"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,.12), rgba(0,0,0,0))" }}
      />

      <div
        className={`hero-cta relative mx-auto flex max-w-7xl px-5 py-4 md:absolute md:inset-x-0 md:bottom-8 md:px-16 md:py-0 ${POSITION[position]}`}
      >
        <Link href={href} className="hero-button">
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
