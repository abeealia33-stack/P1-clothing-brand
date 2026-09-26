"use client";

import Link from "next/link";
import { useActionState } from "react";
import AdminField from "./AdminField";
import ColorEditor from "./ColorEditor";
import FormErrors from "./FormErrors";
import PhotoUploader from "./PhotoUploader";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/app/admin/products/actions";
import {
  standardSizes,
  type Category,
  type Product,
  type ResolvedCollection,
} from "@/lib/types";

/** Field id -> its label, so the summary at the top can name what to fix. */
const fieldLabels: Record<string, string> = {
  name: "Name",
  collection: "Collection",
  categoryIds: "Categories",
  price: "Price",
  stock: "How many you have",
  description: "Description",
  details: "The details",
  sizes: "Sizes",
  colors: "Colours",
  photos: "Photos",
  urdu: "Urdu name",
};

/**
 * One form for adding and editing.
 *
 * Every label is in the words the owner would use out loud — "How many do you
 * have?" rather than "stock" — and every field says what it does to the shop.
 */
export default function ProductForm({
  product,
  categories,
  collections,
}: {
  product?: Product;
  categories: Category[];
  /** All four, hidden ones included — a piece still has to be filed somewhere. */
  collections: ResolvedCollection[];
}) {
  const editing = product !== undefined;
  const [state, action, pending] = useActionState<ProductFormState, FormData>(
    editing ? updateProductAction : createProductAction,
    {}
  );

  const errors = state.errors ?? {};
  const kept = state.values ?? {};
  const value = (field: string, fallback: string) =>
    kept[field] !== undefined ? kept[field] : fallback;

  const checkedSizes = new Set(
    kept.sizes !== undefined
      ? kept.sizes.split(",").filter(Boolean)
      : product?.sizes ?? ["S", "M", "L", "XL"]
  );

  const checkedCategories = new Set(
    kept.categoryIds !== undefined
      ? kept.categoryIds.split(",").filter(Boolean)
      : product?.categoryIds ?? []
  );

  return (
    <form action={action} className="mt-8 max-w-2xl">
      {editing && <input type="hidden" name="id" value={product.id} />}

      <FormErrors errors={state.errors} labels={fieldLabels} />

      <AdminField
        id="name"
        label="Name"
        hint="What it is called in the shop, like “Dhoop kurta”."
        error={errors.name}
      >
        <input
          id="name"
          name="name"
          defaultValue={value("name", product?.name ?? "")}
          className="field"
          required
        />
      </AdminField>

      <AdminField
        id="collection"
        label="Collection"
        hint="Which part of the shop it belongs in."
        error={errors.collection}
      >
        <select
          id="collection"
          name="collection"
          defaultValue={value("collection", product?.collection ?? "rozana")}
          className="field"
        >
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name} — {c.line}
              {c.inNav ? "" : " (hidden)"}
            </option>
          ))}
        </select>
      </AdminField>

      <AdminField
        id="categoryIds"
        label="Categories"
        hint={
          categories.length > 0
            ? "Tick any that apply. A piece can belong to more than one."
            : "None yet — add some from Categories in the admin menu."
        }
        error={errors.categoryIds}
      >
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <label key={category.id} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={checkedCategories.has(category.id)}
                className="h-4 w-4 accent-[var(--color-sage-deep)]"
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>
      </AdminField>

      <div className="grid gap-5 sm:grid-cols-2">
        <AdminField
          id="price"
          label="Price in rupees"
          hint="Whole rupees, no commas."
          error={errors.price}
        >
          <input
            id="price"
            name="price"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            defaultValue={value("price", product ? String(product.price) : "")}
            className="field tnum"
            required
          />
        </AdminField>

        <AdminField
          id="stock"
          label="How many do you have?"
          hint="At zero it shows as sold out."
          error={errors.stock}
        >
          <input
            id="stock"
            name="stock"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            defaultValue={value("stock", product ? String(product.stock) : "0")}
            className="field tnum"
            required
          />
        </AdminField>
      </div>

      <AdminField
        id="description"
        label="Description"
        hint="A line or two, the way you would describe it to a customer."
        error={errors.description}
      >
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={value("description", product?.description ?? "")}
          className="field"
          required
        />
      </AdminField>

      <AdminField
        id="details"
        label="The details"
        hint="One per line — fabric, length, washing. These appear as a list."
        error={errors.details}
      >
        <textarea
          id="details"
          name="details"
          rows={5}
          defaultValue={value("details", (product?.details ?? []).join("\n"))}
          placeholder={"100% cotton, pre-washed\nLength 42 inches\nMachine wash cold"}
          className="field"
        />
      </AdminField>

      <AdminField
        id="sizes"
        label="Sizes"
        required
        hint="Tick the sizes you have. Customers only see the ones ticked here."
        error={errors.sizes}
      >
        <div className="flex flex-wrap gap-4">
          {standardSizes.map((size) => (
            <label key={size} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="sizes"
                value={size}
                defaultChecked={checkedSizes.has(size)}
                className="h-4 w-4 accent-[var(--color-sage-deep)]"
              />
              <span className="text-sm">{size}</span>
            </label>
          ))}
        </div>
      </AdminField>

      <AdminField
        id="colors"
        label="Colours"
        required
        hint="At least one. The shop shows a dot for each colour a piece comes in."
        error={errors.colors}
      >
        <ColorEditor name="colors" initial={product?.colors ?? []} />
      </AdminField>

      <AdminField
        id="photos"
        label="Photos"
        required
        hint="At least one. The first is the one shoppers see first."
        error={errors.photos}
      >
        <PhotoUploader name="photos" initial={product?.photos ?? []} />
      </AdminField>

      <AdminField
        id="urdu"
        label="Urdu name (optional)"
        hint="Shown as a flourish under the name. Leave empty if unsure."
        error={errors.urdu}
      >
        <input
          id="urdu"
          name="urdu"
          dir="rtl"
          defaultValue={value("urdu", product?.urdu ?? "")}
          className="field urdu"
        />
      </AdminField>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product ? product.active : true}
          className="mt-1 h-4 w-4 accent-[var(--color-sage-deep)]"
        />
        <span>
          <span className="block text-sm font-medium">Show in the shop</span>
          <span className="block text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Untick to hide it from customers without deleting it. Needs at least two photos to show.
          </span>
        </span>
      </label>

      <div className="rule mt-8 flex flex-wrap gap-3 pt-6">
        <button type="submit" disabled={pending} className="btn btn-ink">
          {pending ? "Saving" : editing ? "Save changes" : "Add to shop"}
        </button>
        <Link href="/admin/products" className="btn btn-quiet">
          Cancel
        </Link>
      </div>
    </form>
  );
}
