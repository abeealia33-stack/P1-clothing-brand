"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { saveCollections } from "@/lib/settings";
import { collections, type CollectionEdits } from "@/lib/types";

export type CollectionsFormState = { errors?: Record<string, string> };

/**
 * Saves the owner's wording for the four collections, and which of them show
 * in the menus. The slugs themselves are never written: they are what every
 * product is filed under, so only the words on top of them can change.
 */
export async function saveCollectionsAction(
  _previous: CollectionsFormState,
  formData: FormData
): Promise<CollectionsFormState> {
  await requireAdmin();

  const edits: CollectionEdits = {};

  for (const { slug } of collections) {
    edits[slug] = {
      name: String(formData.get(`${slug}.name`) ?? "").trim(),
      urdu: String(formData.get(`${slug}.urdu`) ?? "").trim(),
      line: String(formData.get(`${slug}.line`) ?? "").trim(),
      intro: String(formData.get(`${slug}.intro`) ?? "").trim(),
      // An unchecked box sends nothing at all, which is how it means hidden.
      inNav: formData.get(`${slug}.inNav`) === "on",
    };
  }

  try {
    await saveCollections(edits);
  } catch (error) {
    console.error("Could not save the collections", error);
    return { errors: { form: "Could not save. Try again." } };
  }

  /* The collections are read by the header and footer on every storefront
     page, so the whole shop is refreshed rather than one route. */
  revalidatePath("/", "layout");
  revalidatePath("/admin/collections");
  redirect("/admin/collections?saved=1");
}
