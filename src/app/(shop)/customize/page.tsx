import type { Metadata } from "next";
import CustomizeForm from "@/components/CustomizeForm";
import { listProductChoices } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Custom design" };

export default async function CustomizePage() {
  const products = await listProductChoices();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-[2.25rem] md:text-[3.5rem]">Custom design</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        Pick a piece as your starting point, send us your measurements, and
        we will call you to agree a price before anything is made.
      </p>
      <CustomizeForm products={products} />
    </div>
  );
}
