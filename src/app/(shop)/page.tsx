import Link from "next/link";
import { Fragment } from "react";
import CollectionRail from "@/components/CollectionRail";
import DayPicker, { type ShownDay } from "@/components/DayPicker";
import GroupOrdersSection from "@/components/GroupOrdersSection";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import PromoStrip from "@/components/PromoStrip";
import ReelsRail from "@/components/ReelsRail";
import SplitBanner from "@/components/SplitBanner";
import {
  bannerHref,
  dayKeys,
  dayLabels,
  dayProductIds,
  linkedProductIds,
  resolveHomeBanners,
  type HomeBanners,
  type HomeBlock,
} from "@/lib/banners";
import { liveProductSlugs, liveProductsByIds, newestProducts } from "@/lib/catalogue";
import { listReels, type Reel } from "@/lib/reels";
import { getNavCollections, getSettings } from "@/lib/settings";
import { rupees } from "@/lib/format";
import type { Product, ResolvedCollection } from "@/lib/types";
import { site } from "@/lib/site";

const DEFAULT_HERO = "/cloth/hero.svg";

export default async function HomePage() {
  // None of these depends on the others, and this is the page most people
  // land on, so they go together rather than one round trip after another.
  const [newIn, reels, { hero, banners }, shownCollections] = await Promise.all([
    newestProducts(4),
    listReels(),
    getSettings(),
    getNavCollections(),
  ]);

  // Banners store the pieces they point at by id, not address, so both the
  // addresses and the day picker's pieces are looked up here, together.
  const [productSlugs, dayProducts] = await Promise.all([
    liveProductSlugs([
      ...linkedProductIds(banners),
      ...(hero.link.kind === "product" ? [hero.link.id] : []),
    ]),
    liveProductsByIds(dayProductIds(banners)),
  ]);
  const { strip, split } = resolveHomeBanners(banners, productSlugs);
  const days = shownDays(banners, dayProducts);

  /*
   * The middle of the page, in whatever order the owner has put it.
   *
   * Each entry draws nothing when it has nothing to show, so an empty one
   * leaves no gap and simply gives up its turn. The hero and the promises
   * under it are the page's frame and stay where they are.
   */
  const blocks: Record<HomeBlock, React.ReactNode> = {
    collections: <CollectionsBlock shownCollections={shownCollections} />,
    newIn: <NewInBlock newIn={newIn} />,
    dayPicker: days.length > 0 && <DayPicker days={days} />,
    groupOrders: <GroupOrdersSection image={banners.groupImage} />,
    pair: split && <SplitBanner panels={split.panels} />,
    carousel: strip && <PromoStrip strip={strip} />,
    reels: <ReelsBlock reels={reels} />,
  };

  return (
    <>
      {/* The fold: this stays put while the paper below slides up over it. */}
      <HeroBanner
        desktopImage={hero.desktopImage || DEFAULT_HERO}
        mobileImage={hero.mobileImage}
        buttonLabel={hero.buttonLabel}
        href={bannerHref(hero.link, productSlugs)}
        position={hero.position}
        focus={hero.focus}
      />

      <div className="fold-body">
        {/* The three promises, first thing under the photo, where they can
            still change someone's mind rather than at the foot of the page. */}
        <p className="trust-strip tnum px-5 py-2.5 text-center">
          Cash on delivery <span aria-hidden="true">·</span> Free over PKR{" "}
          {rupees(site.freeShippingOver)} <span aria-hidden="true">·</span>{" "}
          <Link href="/shipping" className="underline-offset-4 hover:underline">
            7-day exchange
          </Link>
        </p>

        {banners.order.map((block) => (
          <Fragment key={block}>{blocks[block]}</Fragment>
        ))}
      </div>
    </>
  );
}

/* A day shows once it has at least one live piece; the rest stay out of the
   chips rather than offering a choice that leads to nothing. */
function shownDays(banners: HomeBanners, products: Map<string, Product>): ShownDay[] {
  return dayKeys.flatMap((key) => {
    const day = banners.days[key];
    const picked = day.productIds.flatMap((id) => products.get(id) ?? []);
    return picked.length > 0
      ? [{ key, label: dayLabels[key], reason: day.reason, products: picked }]
      : [];
  });
}

/* Everything below is one block of the orderable middle. */

function CollectionsBlock({ shownCollections }: { shownCollections: ResolvedCollection[] }) {
  if (shownCollections.length === 0) return null;

  return (
    <section className="home-section mx-auto max-w-7xl px-5 md:px-16">
      <h2 className="home-h2 mb-6">Shop by collection</h2>
      <CollectionRail collections={shownCollections} />
    </section>
  );
}

/* Nothing new to show until there are pieces: an empty band under a "Just in"
   heading reads as a broken page, not an empty shop. A piece without a photo
   is left out for the same reason. */
function NewInBlock({ newIn }: { newIn: Product[] }) {
  const shown = newIn.filter((p) => p.photos.length > 0);
  if (shown.length === 0) return null;

  return (
    <section className="home-section mx-auto max-w-7xl px-5 md:px-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="home-h2">Just in</h2>
        <Link href="/shop" className="shrink-0 text-sm underline underline-offset-4">
          See all
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
        {shown.map((product, i) => (
          <ProductCard key={product.slug} product={product} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}

function ReelsBlock({ reels }: { reels: Reel[] }) {
  if (reels.length === 0) return null;

  return (
    <section className="home-section">
      <div className="mx-auto mb-6 max-w-7xl px-5 md:px-16">
        <h2 className="home-h2">See it worn</h2>
      </div>
      <ReelsRail reels={reels} />
    </section>
  );
}
