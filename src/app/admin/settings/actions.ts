"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { emptyHero, normaliseHero } from "@/lib/hero";
import { saveSettings, type PaymentAccounts } from "@/lib/settings";

export type SettingsFormState = { errors?: Record<string, string> };

export async function saveSettingsAction(
  _previous: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  let hero = emptyHero();
  try {
    hero = normaliseHero(JSON.parse(String(formData.get("hero") ?? "{}")));
  } catch {
    return { errors: { form: "Could not read the hero settings. Try again." } };
  }

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
    await saveSettings({ hero, payments });
  } catch (error) {
    console.error("Could not save the settings", error);
    return { errors: { form: "Could not save. Try again." } };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
