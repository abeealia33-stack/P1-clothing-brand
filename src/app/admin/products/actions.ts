"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  getProductById,
  isSlugTaken,
  updateProduct,
  type ProductInput,
} from "@/lib/catalogue";
import { isCollectionSlug, standardSizes, type ProductColor } from "@/lib/types";

export type ProductFormState = {
  errors?: Record<string, string>;
  /** Echoed back so a rejected form does not lose what was typed. */
  values?: Record<string, string>;
};

/** "Suti kurta" -> "suti-kurta"; also what the shop URL will be. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function parseJsonArray<T>(raw: string): T[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

/** One per line is how a person writes a list, so that is what we accept. */
const lines = (raw: string) =>
  raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

async function readForm(
  formData: FormData,
  exceptId?: string
): Promise<{ input?: ProductInput; errors: Record<string, string> }> {
  const errors: Record<string, string> = {};

  const name = String(formData.get("name") ?? "").trim();
  const collection = String(formData.get("collection") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const stockRaw = String(formData.get("stock") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const urdu = String(formData.get("urdu") ?? "").trim();
  const checkedSizes = new Set(formData.getAll("sizes").map(String));
  const sizes = standardSizes.filter((s) => checkedSizes.has(s));
  const categoryIds = formData.getAll("categoryIds").map(String);
  const details = lines(String(formData.get("details") ?? ""));
  const colours = parseJsonArray<ProductColor>(String(formData.get("colors") ?? "[]"));
  const photos = parseJsonArray<string>(String(formData.get("photos") ?? "[]"));
  const active = formData.get("active") === "on";

  if (name.length < 2) errors.name = "Give the piece a name.";
  if (!isCollectionSlug(collection)) errors.collection = "Pick a collection.";

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(price)) {
    errors.price = "Enter the price in whole rupees, like 2400.";
  }

  const stock = Number(stockRaw);
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    errors.stock = "Enter how many you have, like 12.";
  }

  if (description.length < 10) {
    errors.description = "Write a line or two about the piece.";
  }
  if (sizes.length === 0) errors.sizes = "Add at least one size.";
  if (colours.length === 0) errors.colors = "Add at least one colour.";
  if (photos.length === 0) errors.photos = "Add at least one photo.";

  const slug = slugify(String(formData.get("slug") ?? "") || name);
  if (!slug) {
    errors.name = "That name cannot be turned into a web address. Try another.";
  } else if (await isSlugTaken(slug, exceptId)) {
    errors.name = "Another piece already uses that name. Change it slightly.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    input: {
      slug,
      name,
      urdu: urdu || null,
      collection,
      price,
      stock,
      description,
      sizes,
      colors: colours,
      photos,
      details,
      active,
      categoryIds,
    },
  };
}

/**
 * Echoed back to a rejected form so it doesn't lose what was picked.
 * "sizes" and "categoryIds" are checkboxes with repeated keys, so it
 * collapses those into one comma-joined value instead of the default
 * one-key-one-value pairing.
 */
function formValues(formData: FormData): Record<string, string> {
  const values = Object.fromEntries(
    Array.from(formData.entries()).map(([k, v]) => [k, String(v)])
  );
  values.sizes = formData.getAll("sizes").map(String).join(",");
  values.categoryIds = formData.getAll("categoryIds").map(String).join(",");
  return values;
}

/** Redraws the shop wherever this piece appears. */
function refreshShop(slug: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/search");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/admin/products");
}

export async function createProductAction(
  _previous: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const { input, errors } = await readForm(formData);
  if (!input) return { errors, values: formValues(formData) };

  try {
    await createProduct(input);
  } catch {
    return { errors: { form: "Could not save that piece. Try again." } };
  }

  refreshShop(input.slug);
  redirect("/admin/products?saved=1");
}

export async function updateProductAction(
  _previous: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { errors: { form: "Missing piece." } };

  const existing = await getProductById(id);
  if (!existing) return { errors: { form: "That piece no longer exists." } };

  const { input, errors } = await readForm(formData, id);
  if (!input) return { errors, values: formValues(formData) };

  try {
    await updateProduct(id, input);
  } catch {
    return { errors: { form: "Could not save that piece. Try again." } };
  }

  refreshShop(input.slug);
  // The URL changes with the name, so refresh the old address too.
  if (existing.slug !== input.slug) refreshShop(existing.slug);
  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/products");

  const existing = await getProductById(id);
  if (existing) {
    await deleteProduct(id);
    refreshShop(existing.slug);
  }
  redirect("/admin/products?deleted=1");
}

/** The one-tap toggle on the list — show or hide without opening the form. */
export async function toggleActiveAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const existing = id ? await getProductById(id) : null;
  if (!existing) redirect("/admin/products");

  await updateProduct(id, { ...existing, active: !existing.active });
  refreshShop(existing.slug);
  redirect("/admin/products");
}
