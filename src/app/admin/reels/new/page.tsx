import type { Metadata } from "next";
import Link from "next/link";
import ReelForm from "@/components/admin/ReelForm";
import { requireAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Add a reel" };

export default async function NewReelPage() {
  await requireAdmin();
  const products = await listProducts({ includeInactive: true });

  return (
    <div className="py-8">
      <Link
        href="/admin/reels"
        className="text-sm underline underline-offset-4"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Back to reels
      </Link>
      <h1 className="mt-4 text-4xl">Add a reel</h1>
      <ReelForm products={products} />
    </div>
  );
}
