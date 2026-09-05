import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReelForm from "@/components/admin/ReelForm";
import DeleteReel from "@/components/admin/DeleteReel";
import { requireAdmin } from "@/lib/auth";
import { getReelById } from "@/lib/reels";
import { listProducts } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const reel = await getReelById(id);
  return { title: reel ? `Edit reel — ${reel.productName}` : "Reel not found" };
}

export default async function EditReelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const [reel, products] = await Promise.all([
    getReelById(id),
    listProducts({ includeInactive: true }),
  ]);
  if (!reel) notFound();

  return (
    <div className="py-8">
      <Link
        href="/admin/reels"
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Back to reels
      </Link>
      <h1 className="mt-4 text-4xl">Edit reel</h1>
      <ReelForm reel={reel} products={products} />
      <DeleteReel id={reel.id} />
    </div>
  );
}
