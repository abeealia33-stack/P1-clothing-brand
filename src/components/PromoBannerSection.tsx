import Link from "next/link";
import ClothImage from "./ClothImage";
import Reveal from "./Reveal";
import type { PromoBanner } from "@/lib/settings";

/**
 * A photo-led promo block for the home page — same overlay-text language as
 * the collection cards, so an owner-uploaded banner still looks like it
 * belongs to the site rather than a pasted-in ad.
 */
export default function PromoBannerSection({ banner }: { banner: PromoBanner }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-6">
      <Reveal>
        <Link
          href={banner.href}
          className="group relative block aspect-[4/5] overflow-hidden sm:aspect-[21/9]"
        >
          <ClothImage
            src={banner.image}
            alt=""
            className="transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-2/3"
            style={{
              background:
                "linear-gradient(to top, rgba(28,26,23,.6) 0%, rgba(28,26,23,0) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
            <h3 className="text-3xl text-white sm:text-4xl">{banner.heading}</h3>
            {banner.subtext && (
              <p className="measure mt-1.5 text-sm text-white/85">{banner.subtext}</p>
            )}
            <span
              className="btn mt-4 inline-flex"
              style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
            >
              {banner.buttonLabel}
            </span>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}
