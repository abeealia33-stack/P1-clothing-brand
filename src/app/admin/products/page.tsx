import type { Metadata } from "next";
import Link from "next/link";
import ClothImage from "@/components/ClothImage";
import { toggleActiveAction } from "./actions";
import { requireAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/catalogue";
import { priceLabel } from "@/lib/format";
import { collections } from "@/lib/types";

export const metadata: Metadata = { title: "Pieces" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireAdmin();

  const { saved, deleted } = await searchParams;
  const products = await listProducts({ includeInactive: true });

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">Pieces</h1>
        <Link href="/admin/products/new" className="btn btn-ink">
          Add a piece
        </Link>
      </div>

      {(saved || deleted) && (
        <p
          role="status"
          className="mt-4 border-l-2 py-2 pl-3 text-sm"
          style={{ borderColor: "var(--color-sage)" }}
        >
          {saved ? "Saved. The shop is showing it now." : "Deleted."}
        </p>
      )}

      {products.length === 0 ? (
        <div
          className="mt-10 border p-8 text-center"
          style={{ borderColor: "var(--color-line)" }}
        >
          <h2 className="text-2xl">Nothing in the shop yet</h2>
          <p
            className="measure mx-auto mt-2 text-sm"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Add your first piece and it appears in the shop straight away.
          </p>
          <Link href="/admin/products/new" className="btn btn-ink mt-5">
            Add a piece
          </Link>
        </div>
      ) : (
        collections.map((collection) => {
          const inGroup = products.filter((p) => p.collection === collection.slug);
          if (inGroup.length === 0) return null;

          return (
            <section key={collection.slug} className="mt-10">
              <h2 className="text-2xl">
                {collection.name}{" "}
                <span
                  className="tnum text-base"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  {inGroup.length}
                </span>
              </h2>

              <ul className="mt-3">
                {inGroup.map((product) => (
                  <li key={product.id} className="rule flex items-center gap-3 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="aspect-[3/4] w-12 shrink-0 overflow-hidden"
                    >
                      <ClothImage src={product.photos[0] ?? ""} alt="" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex items-center gap-2"
                      >
                        <span className="truncate">{product.name}</span>
                        {!product.active && (
                          <span
                            className="shrink-0 px-1.5 py-0.5 text-[0.6875rem]"
                            style={{
                              background: "var(--color-khaddar)",
                              color: "var(--color-ink-soft)",
                            }}
                          >
                            Hidden
                          </span>
                        )}
                        {product.active && product.stock === 0 && (
                          <span
                            className="shrink-0 px-1.5 py-0.5 text-[0.6875rem] text-white"
                            style={{ background: "#9A4A3C" }}
                          >
                            Sold out
                          </span>
                        )}
                      </Link>
                      <p
                        className="tnum mt-0.5 flex flex-wrap gap-x-4 text-sm"
                        style={{ color: "var(--color-ink-soft)" }}
                      >
                        <span>{priceLabel(product.price)}</span>
                        <span>{product.stock} in stock</span>
                        <span>
                          {product.colors.length}{" "}
                          {product.colors.length === 1 ? "colour" : "colours"}
                        </span>
                      </p>
                    </div>

                    {/* One tap to take something off the shop floor. */}
                    <form action={toggleActiveAction} className="shrink-0">
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="h-10 border px-3 text-sm"
                        style={{
                          borderColor: "var(--color-line)",
                          color: "var(--color-ink-soft)",
                        }}
                      >
                        {product.active ? "Hide" : "Show"}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
