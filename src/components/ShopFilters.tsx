"use client";

import { useRouter } from "next/navigation";
import { collections, priceTiers, sortOptions, type Category } from "@/lib/types";

/**
 * Dropdowns instead of rows of chips — the same filters, a fraction of the
 * screen. Each change re-navigates with the other filters kept as they were.
 */
export default function ShopFilters({
  collection,
  category,
  price,
  sort,
  categories,
}: {
  collection?: string;
  category?: string;
  price?: string;
  sort?: string;
  categories: Category[];
}) {
  const router = useRouter();

  const go = (changes: {
    collection?: string;
    category?: string;
    price?: string;
    sort?: string;
  }) => {
    const next = { collection, category, price, sort, ...changes };
    const params = new URLSearchParams();
    if (next.collection) params.set("collection", next.collection);
    if (next.category) params.set("category", next.category);
    if (next.price) params.set("price", next.price);
    if (next.sort) params.set("sort", next.sort);
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-3">
      <Dropdown
        label="Collection"
        value={collection ?? ""}
        onChange={(v) => go({ collection: v || undefined })}
        className="col-span-2 sm:w-48"
      >
        <option value="">All collections</option>
        {collections.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </Dropdown>

      {categories.length > 0 && (
        <Dropdown
          label="Category"
          value={category ?? ""}
          onChange={(v) => go({ category: v || undefined })}
          className="sm:w-48"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Dropdown>
      )}

      <Dropdown
        label="Price"
        value={price ?? ""}
        onChange={(v) => go({ price: v || undefined })}
        className="sm:w-48"
      >
        <option value="">Any price</option>
        {priceTiers.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Dropdown>

      <Dropdown
        label="Sort by"
        value={sort ?? "newest"}
        onChange={(v) => go({ sort: v === "newest" ? undefined : v })}
        className="sm:w-48"
      >
        {sortOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Dropdown>
    </div>
  );
}

function Dropdown({
  label,
  value,
  onChange,
  className = "",
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field h-11 min-h-0 w-full"
      >
        {children}
      </select>
    </label>
  );
}
