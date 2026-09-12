import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import DeleteProduct from "@/components/admin/DeleteProduct";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/categories";
import { getProductById } from "@/lib/catalogue";
import { getAllCollections } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product ? `Edit ${product.name}` : "Piece not found" };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    getProductById(id),
    listCategories(),
    getAllCollections(),
  ]);
  if (!product) notFound();

  return (
    <div className="py-8">
      <Link
        href="/admin/products"
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Back to pieces
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-4xl">{product.name}</h1>
        {product.active && (
          <Link
            href={`/product/${product.slug}`}
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--color-ink-soft)" }}
          >
            See it in the shop
          </Link>
        )}
      </div>

      <ProductForm
        product={product}
        categories={categories}
        collections={collections}
      />

      <DeleteProduct id={product.id} name={product.name} />
    </div>
  );
}
