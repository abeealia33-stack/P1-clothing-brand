import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/lib/catalogue";
import { getNavCollections } from "@/lib/settings";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [results, collections] = await Promise.all([
    searchProducts(q),
    getNavCollections(),
  ]);
  const searched = q.trim().length > 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <h1 className="text-5xl md:text-6xl">Search</h1>

      {/* A plain GET form: it works before the JavaScript arrives, and the
          result is a shareable URL. */}
      <form action="/search" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Kurta, sage, lounge set"
          aria-label="Search for a piece"
          className="field"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-ink shrink-0">
          Search
        </button>
      </form>

      {!searched && collections.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl">Or start from a collection</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?collection=${c.slug}`}
                className="flex h-11 items-center border px-4 text-sm"
                style={{ borderColor: "var(--color-line)" }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="mt-10">
          <h2 className="text-2xl">Nothing matched “{q}”</h2>
          <p className="measure mt-2" style={{ color: "var(--color-ink-soft)" }}>
            Try a fabric, a colour, or a collection name — cotton, sage, Ghar.
          </p>
          <Link href="/shop" className="btn btn-quiet mt-5">
            Browse everything
          </Link>
        </div>
      )}

      {searched && results.length > 0 && (
        <>
          <p className="tnum mt-8 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            {results.length} {results.length === 1 ? "piece" : "pieces"} for “{q}”
          </p>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {results.map((product, i) => (
              <ProductCard key={product.slug} product={product} priority={i < 2} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
