import type { Metadata } from "next";
import BannersForm from "@/components/admin/BannersForm";
import { requireAdmin } from "@/lib/auth";
import { listProductChoices } from "@/lib/catalogue";
import { getAllCollections, getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Home banners" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();

  const { saved } = await searchParams;
  const [{ banners }, collections, products] = await Promise.all([
    getSettings(),
    getAllCollections(),
    listProductChoices(),
  ]);

  return (
    <div className="py-8">
      <h1 className="text-4xl">Home banners</h1>
      <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        The order of the home page, and the two photo sections on it. Each
        photo can lead to a collection, a piece, or the whole shop.
      </p>

      {saved && (
        <p
          role="status"
          className="mt-4 border-l-2 py-2 pl-3 text-sm"
          style={{ borderColor: "var(--color-sage)" }}
        >
          Saved. The home page is updated.
        </p>
      )}

      <BannersForm initial={banners} collections={collections} products={products} />
    </div>
  );
}
