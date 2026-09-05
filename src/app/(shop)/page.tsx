import Link from "next/link";
import CollectionRail from "@/components/CollectionRail";
import HeroSlideshow from "@/components/HeroSlideshow";
import ProductCard from "@/components/ProductCard";
import PromoBannerSection from "@/components/PromoBannerSection";
import ReelsRail from "@/components/ReelsRail";
import SwipeRail from "@/components/SwipeRail";
import { newestProducts } from "@/lib/catalogue";
import { listReels } from "@/lib/reels";
import { getSettings } from "@/lib/settings";
import { rupees } from "@/lib/format";
import { site } from "@/lib/site";

const DEFAULT_HERO = "/cloth/hero.svg";

export default async function HomePage() {
  const newIn = await newestProducts(4);
  const reels = await listReels();
  const { heroImages: uploadedHero, banners } = await getSettings();
  const heroImages = uploadedHero.length > 0 ? uploadedHero : [DEFAULT_HERO];

  return (
    <>
      {/* The fold: this stays put while the paper below slides up over it. */}
      <section className="fold-hero -mt-14 md:-mt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="fold-parallax relative h-full w-full origin-center">
            <HeroSlideshow
              images={heroImages}
              alt="A length of undyed cotton in morning light"
            />
          </div>
        </div>

        <div className="relative flex h-full items-end">
          <div className="hero-copy mx-auto w-full max-w-6xl px-5 pb-14 md:pb-24">
            <p
              className="urdu text-2xl leading-none sm:text-3xl md:text-4xl"
              style={{ color: "var(--color-sage-deep)" }}
            >
              آرام سے تیار
            </p>
            <h1 className="measure-display mt-2 text-[clamp(2.25rem,10vw,3.25rem)] leading-[0.95] md:text-[5rem]">
              Aaram se tayaar
            </h1>
            <p
              className="measure mt-4 text-sm sm:text-base md:text-lg"
              style={{ color: "var(--color-ink)" }}
            >
              Cotton and khaddar you can put on without thinking about it, and
              still feel dressed in by evening.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-7">
              <Link href="/shop?collection=rozana" className="btn btn-ink">
                Shop Rozana
              </Link>
              <Link href="/shop" className="btn btn-quiet">
                See everything
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="fold-body">
        <section className="mx-auto max-w-6xl px-5 pt-16 pb-4 md:pt-24">
          <p className="measure text-2xl leading-[1.35] md:text-[1.75rem]" style={{ fontFamily: "var(--font-display)" }}>
            Bilques makes a small number of pieces in cotton, lawn and khaddar —
            cut loose, sewn properly, and priced so you can own more than one.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <h2 className="text-4xl md:text-5xl">Four ways to get dressed</h2>
          <p
            className="measure mt-2 mb-8 text-sm"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Every piece belongs to one of these. Start wherever your week is.
          </p>
          <CollectionRail />
        </section>

        {banners[0] && <PromoBannerSection banner={banners[0]} />}

        <section className="py-12 md:py-16" style={{ background: "var(--color-khaddar)" }}>
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-4xl md:text-5xl">Just in</h2>
              <Link
                href="/shop"
                className="shrink-0 text-sm underline underline-offset-4"
                style={{ color: "var(--color-ink-soft)" }}
              >
                All pieces
              </Link>
            </div>
          </div>

          {/* Swipeable on phones, a plain grid once there is room for one. */}
          <SwipeRail className="rail mt-8 gap-4 px-5 md:mx-auto md:grid md:max-w-6xl md:grid-cols-4 md:overflow-visible">
            {newIn.map((product, i) => (
              <div key={product.slug} className="w-[68vw] max-w-72 md:w-auto md:max-w-none">
                <ProductCard product={product} priority={i === 0} />
              </div>
            ))}
          </SwipeRail>
        </section>

        {banners[1] && <PromoBannerSection banner={banners[1]} />}

        {reels.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-5">
              <h2 className="text-4xl md:text-5xl">See it worn</h2>
              <p
                className="measure mt-2 mb-8 text-sm"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Short clips of real pieces. Tap one to shop it.
              </p>
            </div>
            <ReelsRail reels={reels} />
          </section>
        )}

        {banners[2] && <PromoBannerSection banner={banners[2]} />}

        <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          {/* A hairline over each promise, so the three read as a set of
              terms rather than three loose paragraphs. */}
          <dl className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            <div className="rule pt-5">
              <dt className="text-2xl">Pay when it arrives</dt>
              <dd className="mt-1.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                Cash on delivery everywhere in Pakistan. Bank transfer, JazzCash
                and EasyPaisa also accepted.
              </dd>
            </div>
            <div className="rule pt-5">
              <dt className="tnum text-2xl">
                Free over PKR {rupees(site.freeShippingOver)}
              </dt>
              <dd className="mt-1.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                {site.shipping.majorCities} to Karachi, Lahore and Islamabad.{" "}
                {site.shipping.elsewhere} everywhere else.
              </dd>
            </div>
            <div className="rule pt-5">
              <dt className="text-2xl">Wrong size, no argument</dt>
              <dd className="mt-1.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                Exchange any unworn piece within seven days.{" "}
                <Link href="/shipping" className="underline underline-offset-4">
                  Read the policy
                </Link>
                .
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}
