import type { Metadata } from "next";
import Link from "next/link";
import ClothImage from "@/components/ClothImage";
import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/ShopFilters";
import { listCategories } from "@/lib/categories";
import { countLiveProducts, listProducts } from "@/lib/catalogue";
import { getNavCollections, getSettings } from "@/lib/settings";
import { isPriceTier, isSortOption, resolveCollection } from "@/lib/types";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    collection?: string;
    category?: string;
    price?: string;
    sort?: string;
  }>;
}) {
  const { collection, category, price, sort } = await searchParams;
  const { collections: collectionEdits } = await getSettings();
  const active = collection
    ? resolveCollection(collection, collectionEdits)
    : undefined;
  const priceTier = price && isPriceTier(price) ? price : undefined;
  const sortBy = sort && isSortOption(sort) ? sort : undefined;

  const [list, categories, liveCount, filterCollections] = await Promise.all([
    listProducts({
      collection: active?.slug,
      category,
      priceTier,
      sort: sortBy,
    }),
    listCategories(),
    // Only the unfiltered view quotes a total, so a filtered one does not pay
    // for a count it will not print.
    active ? 0 : countLiveProducts(),
    // A hidden range still shows in the filter while it is the one being
    // viewed, so the control matches the grid under it.
    getNavCollections(active?.slug),
  ]);

  const activeCategory = category ? categories.find((c) => c.slug === category) : undefined;
  const hasFilters = Boolean(active || activeCategory || priceTier || sortBy);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-16 md:py-14">
      {/* A collection's own photo strip, when the owner has uploaded one. */}
      {active?.banner && (
        <div className="relative -mx-5 -mt-10 mb-8 aspect-[2/1] overflow-hidden md:mx-0 md:-mt-4 md:aspect-[4/1]">
          <ClothImage src={active.banner} alt="" priority />
        </div>
      )}
      <h1 className="text-[2.25rem] md:text-[3.5rem]">
        {active ? active.name : "Everything"}
      </h1>
      {active ? (
        <p className="urdu mt-1 text-2xl" style={{ color: "var(--color-sage-deep)" }}>
          {active.urdu}
        </p>
      ) : null}
      {/* Counted, never claimed: the old copy promised thirteen pieces
          whatever was actually on the shelf. */}
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        {active
          ? active.line
          : liveCount > 0
            ? `${liveCount} ${liveCount === 1 ? "piece" : "pieces"}, made in small runs. Filter by how you plan to wear them.`
            : "Made in small runs. New pieces go up here as they are finished."}
      </p>

      {/* Sticky under the header: on a long grid the filters are what you
          reach for next, and scrolling back up to find them is the whole
          friction. */}
      <div
        className="sticky top-14 z-20 -mx-5 mt-8 px-5 py-3 md:top-16 md:mx-0 md:px-0"
        style={{ background: "var(--color-paper)" }}
      >
        <ShopFilters
          collection={active?.slug}
          category={activeCategory?.slug}
          price={priceTier}
          sort={sortBy}
          categories={categories}
          collections={filterCollections}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="tnum text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {list.length} {list.length === 1 ? "piece" : "pieces"}
        </p>
        {hasFilters && (
          <Link
            href="/shop"
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Clear filters
          </Link>
        )}
      </div>

      {list.length === 0 ? (
        <div
          className="mt-10 border p-8 text-center"
          style={{ borderColor: "var(--color-line)" }}
        >
          <p className="text-lg">Nothing in this range yet.</p>
          <p className="measure mx-auto mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Try a different price, category or collection.
          </p>
          {hasFilters && (
            <Link href="/shop" className="btn btn-quiet mt-5">
              See everything
            </Link>
          )}
        </div>
      ) : (
        /* Keyed on the filters, so a new set of results arrives visibly
           instead of the page quietly redrawing under you. */
        <div
          key={`${active?.slug ?? ""}|${activeCategory?.slug ?? ""}|${priceTier ?? ""}|${sortBy ?? ""}`}
          className="grid-in mt-4 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4"
        >
          {list.map((product, i) => (
            <ProductCard key={product.slug} product={product} priority={i < 2} />
          ))}
        </div>
      )}
    </div>
  );
}
