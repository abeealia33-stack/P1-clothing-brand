"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { saveSettings, type PaymentAccounts } from "@/lib/settings";

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
    await saveSettings({ heroImages, payments });
  } catch (error) {
    console.error("Could not save the settings", error);
    return { errors: { form: "Could not save. Try again." } };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
