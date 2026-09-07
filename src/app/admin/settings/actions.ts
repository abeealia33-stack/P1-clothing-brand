"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  saveSettings,
  type PaymentAccounts,
  type PromoBanner,
} from "@/lib/settings";

export type SettingsFormState = { errors?: Record<string, string> };

function parseJsonArray<T>(raw: string): T[] {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

export async function saveSettingsAction(
  _previous: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  const heroImages = parseJsonArray<string>(String(formData.get("heroImages") ?? "[]")).filter(
    (v) => typeof v === "string"
  );

  // Half-filled banner rows (e.g. a photo dropped but no heading typed yet)
  // are dropped rather than shown broken on the storefront.
  const banners = parseJsonArray<PromoBanner>(String(formData.get("banners") ?? "[]"))
    .map((b) => ({
      image: String(b.image ?? "").trim(),
      heading: String(b.heading ?? "").trim(),
      subtext: String(b.subtext ?? "").trim(),
      buttonLabel: String(b.buttonLabel ?? "").trim() || "Shop now",
      href: String(b.href ?? "").trim() || "/shop",
    }))
    .filter((b) => b.image && b.heading);

  /* Only the shape is checked here; saveSettings drops any account missing a
     title or a number, so a half-typed row never reaches a customer. */
  let payments: PaymentAccounts = {};
  try {
    const parsed = JSON.parse(String(formData.get("payments") ?? "{}"));
    if (parsed && typeof parsed === "object") payments = parsed as PaymentAccounts;
  } catch {
    payments = {};
  }

  try {
    await saveSettings({ heroImages, banners, payments });
  } catch {
    return { errors: { form: "Could not save. Try again." } };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
