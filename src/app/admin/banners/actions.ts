"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { normaliseHomeBanners } from "@/lib/banners";
import { saveHomeBanners } from "@/lib/settings";

export type BannersFormState = { errors?: Record<string, string> };

/**
 * Saves the strip of three cards and the pair of photos.
 *
 * A section missing a photo is saved as it is rather than refused: the owner
 * may be putting a promotion together a picture at a time, and the home page
 * already holds a section back until all of its photos are in. The form says
 * which sections are live and which are waiting.
 */
export async function saveBannersAction(
  _previous: BannersFormState,
  formData: FormData
): Promise<BannersFormState> {
  await requireAdmin();

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("banners") ?? "{}"));
  } catch {
    return { errors: { form: "The banners could not be read. Reload the page and try again." } };
  }

  try {
    // Normalised here as well as on the way out, so what is stored is always
    // three cards and two panels with links that lead somewhere.
    await saveHomeBanners(normaliseHomeBanners(raw));
  } catch (error) {
    console.error("Could not save the home banners", error);
    return { errors: { form: "Could not save. Try again." } };
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners?saved=1");
}
