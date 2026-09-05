"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createCategory,
  deleteCategory,
  isCategorySlugTaken,
  renameCategory,
  reorderCategory,
} from "@/lib/categories";

export type CategoryFormState = { errors?: Record<string, string> };

/** "New in" -> "new-in"; also what the shop's category filter link will be. */
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

function refresh() {
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}

export async function createCategoryAction(
  _previous: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { errors: { name: "Give the category a name." } };

  const slug = slugify(name);
  if (!slug) return { errors: { name: "That name cannot be turned into a link. Try another." } };
  if (await isCategorySlugTaken(slug)) {
    return { errors: { name: "A category with that name already exists." } };
  }

  await createCategory(name, slug);
  refresh();
  redirect("/admin/categories?saved=1");
}

export async function renameCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || name.length < 2) redirect("/admin/categories");

  const slug = slugify(name);
  if (!slug || (await isCategorySlugTaken(slug, id))) redirect("/admin/categories");

  await renameCategory(id, name, slug);
  refresh();
  redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteCategory(id);
    refresh();
  }
  redirect("/admin/categories?deleted=1");
}

export async function moveCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (id && (direction === "up" || direction === "down")) {
    await reorderCategory(id, direction);
    refresh();
  }
  redirect("/admin/categories");
}
