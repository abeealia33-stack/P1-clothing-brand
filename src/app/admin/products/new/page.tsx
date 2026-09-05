import type { Metadata } from "next";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/categories";

export const metadata: Metadata = { title: "Add a piece" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await listCategories();

  return (
    <div className="py-8">
      <Link
        href="/admin/products"
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Back to pieces
      </Link>
      <h1 className="mt-4 text-4xl">Add a piece</h1>
      <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        It appears in the shop as soon as you save, unless you untick the box at
        the bottom.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
