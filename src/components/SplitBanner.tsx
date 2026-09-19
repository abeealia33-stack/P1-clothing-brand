import Link from "next/link";
import ClothImage from "./ClothImage";
import Reveal from "./Reveal";
import type { ShownSlot } from "@/lib/banners";

/** When each half starts, after the section comes on screen. */
const BEATS = ["180ms", "280ms"];

/** Each half's words sit on its outer edge, so the pair reads as a spread. */
const SIDES = [
  {
    gradient: "linear-gradient(to right, rgba(28,26,23,.66) 0%, rgba(28,26,23,0) 65%)",
    copy: "left-0 items-start text-left",
  },
  {
    gradient: "linear-gradient(to left, rgba(28,26,23,.66) 0%, rgba(28,26,23,0) 65%)",
    copy: "right-0 items-end text-right",
  },
];

/**
 * Two photographs side by side on a dark band — a spread, the way a
 * lookbook opens across two pages.
 *
 * The band is the site's ink rather than black: pure black is not in the
 * palette, and against the paper above and below it would read as an advert
 * set into the page rather than part of it.
 *
 * It shares the strip's entrance, but the halves do not lift on hover — only
 * the photograph moves — because a panel this large rising off the page is
 * more movement than the gesture asked for.
 */
export default function SplitBanner({ panels }: { panels: ShownSlot[] }) {
  return (
    <section style={{ background: "var(--color-ink)" }}>
      <Reveal lift={false} threshold={0.14} rootMargin="0px">
        <div className="grid gap-3 p-3 md:grid-cols-2 md:gap-4 md:p-4">
          {panels.map((panel, i) => (
            <div
              key={i}
              className="banner-item"
              style={{ "--beat": BEATS[i] } as React.CSSProperties}
            >
              <Link
                href={panel.href}
                className="banner-card relative block aspect-[4/5] overflow-hidden md:aspect-[6/5]"
              >
                <div className="banner-zoom absolute inset-0">
                  <ClothImage src={panel.image} alt="" className="banner-photo" />
                </div>
                <div className="absolute inset-0" style={{ background: SIDES[i].gradient }} />
                <div
                  className={`absolute bottom-0 flex max-w-md flex-col p-6 md:p-10 ${SIDES[i].copy}`}
                >
                  {panel.heading && (
                    <h3 className="text-3xl leading-tight text-white md:text-4xl">
                      {panel.heading}
                    </h3>
                  )}
                  <span className="banner-cta mt-4 inline-block">
                    <span
                      className="banner-button btn"
                      style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
                    >
                      {panel.buttonLabel}
                    </span>
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
