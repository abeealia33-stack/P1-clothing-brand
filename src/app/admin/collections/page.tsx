import type { Metadata } from "next";
import CollectionsForm from "@/components/admin/CollectionsForm";
import { requireAdmin } from "@/lib/auth";
import { getAllCollections } from "@/lib/settings";
import { countProductsByCollection } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Collections" };
export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();

  const { saved } = await searchParams;
  const [collections, counts] = await Promise.all([
    getAllCollections(),
    countProductsByCollection(),
  ]);

  return (
    <div className="py-8">
      <h1 className="text-4xl">Collections</h1>
      <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        The four sections of the shop. You can change how each one is worded,
        and hide the ones you are not selling yet — hiding takes a collection
        out of the menus without touching the pieces filed under it.
      </p>

      {saved && (
        <p
          role="status"
          className="mt-4 border-l-2 py-2 pl-3 text-sm"
          style={{ borderColor: "var(--color-sage)" }}
        >
          Saved. The shop is updated.
        </p>
      )}

      <CollectionsForm collections={collections} counts={counts} />
    </div>
  );
}
