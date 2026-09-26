"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  priceTiers,
  sortOptions,
  type Category,
  type ResolvedCollection,
} from "@/lib/types";

type Filters = { collection?: string; category?: string; price?: string; sort?: string };

const href = (next: Filters) => {
  const params = new URLSearchParams();
  if (next.collection) params.set("collection", next.collection);
  if (next.category) params.set("category", next.category);
  if (next.price) params.set("price", next.price);
  if (next.sort) params.set("sort", next.sort);
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
};

/**
 * The collections as a row of chips — the choice most people make — and
 * everything else behind one "Filter & sort" button, so products start
 * within the first screen on a phone. The button opens a sheet from the
 * bottom on a phone and a panel under the chips on a desktop.
 */
export default function ShopFilters({
  collection,
  category,
  price,
  sort,
  categories,
  collections,
}: Filters & { categories: Category[]; collections: ResolvedCollection[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = { collection, category, price, sort };
  const extra = [category, price, sort].filter(Boolean).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (changes: Filters) => {
    router.push(href({ ...current, ...changes }));
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <nav aria-label="Collections" className="rail min-w-0 flex-1 gap-2">
          {[{ slug: undefined, name: "All" }, ...collections].map((c) => {
            const on = c.slug === collection;
            return (
              <Link
                key={c.slug ?? "all"}
                href={href({ ...current, collection: c.slug })}
                aria-current={on ? "page" : undefined}
                className="flex h-10 shrink-0 items-center rounded-full border px-4 text-sm transition-colors"
                style={{
                  borderColor: on ? "var(--color-ink)" : "var(--color-line)",
                  background: on ? "var(--color-ink)" : "transparent",
                  color: on ? "var(--color-paper)" : "var(--color-ink)",
                }}
              >
                {c.name}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="shop-filter-panel"
          className="h-10 shrink-0 text-sm underline underline-offset-4"
        >
          Filter &amp; sort{extra > 0 ? ` (${extra})` : ""}
        </button>
      </div>

      {open && (
        <>
          {/* Phones: a dimmed page behind a sheet from the bottom. */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/30 md:hidden"
          />
          <div
            id="shop-filter-panel"
            role="dialog"
            aria-label="Filter and sort"
            className="settle fixed inset-x-0 bottom-0 z-[61] max-h-[80svh] overflow-y-auto border-t p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:static md:z-auto md:mt-4 md:max-h-none md:border md:p-5"
            style={{ background: "var(--color-paper)", borderColor: "var(--color-line)" }}
          >
            <div className="flex items-baseline justify-between md:hidden">
              <p className="text-2xl">Filter &amp; sort</p>
              <button type="button" onClick={() => setOpen(false)} className="text-sm underline underline-offset-4">
                Done
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:mt-0 md:grid-cols-3">
              {categories.length > 0 && (
                <Choice
                  label="Category"
                  value={category ?? ""}
                  onChange={(v) => go({ category: v || undefined })}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Choice>
              )}

              <Choice label="Price" value={price ?? ""} onChange={(v) => go({ price: v || undefined })}>
                <option value="">Any price</option>
                {priceTiers.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Choice>

              <Choice
                label="Sort by"
                value={sort ?? "newest"}
                onChange={(v) => go({ sort: v === "newest" ? undefined : v })}
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Choice>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Choice({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field mt-1 h-11 min-h-0 w-full">
        {children}
      </select>
    </label>
  );
}
