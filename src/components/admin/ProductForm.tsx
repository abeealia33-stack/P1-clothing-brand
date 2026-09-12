"use client";

import Link from "next/link";
import { useActionState } from "react";
import ColorEditor from "./ColorEditor";
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

      {errors.form && (
        <p
          role="alert"
          className="mb-6 border p-4 text-sm"
          style={{ borderColor: "var(--color-alert)", color: "var(--color-alert)" }}
        >
          {errors.form}
        </p>
      )}

      <Field
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
      </Field>

      <Field
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
      </Field>

      <Field
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
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
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
        </Field>

        <Field
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
        </Field>
      </div>

      <Field
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
      </Field>

      <Field
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
      </Field>

      <Field
        id="sizes"
        label="Sizes"
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
      </Field>

      <Field id="colors" label="Colours" error={errors.colors}>
        <ColorEditor name="colors" initial={product?.colors ?? []} />
      </Field>

      <Field id="photos" label="Photos" error={errors.photos}>
        <PhotoUploader name="photos" initial={product?.photos ?? []} />
      </Field>

      <Field
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
      </Field>

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
            Untick to hide it from customers without deleting it.
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

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {hint && (
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm" style={{ color: "var(--color-alert)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
