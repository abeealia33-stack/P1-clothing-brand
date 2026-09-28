import Link from "next/link";
import ClothImage from "./ClothImage";
import Reveal from "./Reveal";
import type { ShownSlot } from "@/lib/banners";

/** When each half starts, after the section comes on screen. */
const BEATS = ["180ms", "280ms"];

/**
 * Two promotions side by side: the photograph above, the words below it on
 * khaddar. Words under a picture rather than over one — the owner uploads
 * whatever photograph she has, and type laid over an unknown image is a
 * gamble taken on every one of them.
 */
export default function SplitBanner({ panels }: { panels: ShownSlot[] }) {
  return (
    <section className="home-section">
      <div className="mx-auto max-w-7xl px-5 md:px-16">
        <Reveal lift={false} threshold={0.14} rootMargin="0px">
          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            {panels.map((panel, i) => (
              <div
                key={i}
                className="banner-item"
                style={{ "--beat": BEATS[i] } as React.CSSProperties}
              >
                <Link href={panel.href} className="promo-card group">
                  <div className="promo-card-photo">
                    <div className="banner-zoom absolute inset-0">
                      <ClothImage src={panel.image} alt="" className="banner-photo" />
                    </div>
                  </div>
                  <div className="promo-card-foot">
                    {panel.heading && <h3 className="promo-card-heading">{panel.heading}</h3>}
                    {panel.buttonLabel && (
                      <span className="promo-card-cta">
                        {panel.buttonLabel}
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
