import type { Metadata } from "next";
import CustomizeForm from "@/components/CustomizeForm";
import { listProducts } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Custom design" };

/* The styles to start from are the live catalogue, so this cannot be cached
   as a page that never changes — see the home page for the same reason. */
export const revalidate = 60;

export default async function CustomizePage() {
  const products = await listProducts();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-5xl md:text-6xl">Custom design</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        Pick a piece as your starting point, send us your measurements, and
        we will call you to agree a price before anything is made.
      </p>
      <CustomizeForm products={products} />
    </div>
  );
}
