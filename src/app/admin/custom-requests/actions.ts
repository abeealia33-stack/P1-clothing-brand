"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setCustomRequestStatus } from "@/lib/custom-requests-db";
import { isCustomRequestStatus } from "@/lib/types";

export type StatusState = { error?: string; savedAt?: number };

export async function setCustomRequestStatusAction(
  _previous: StatusState,
  formData: FormData
): Promise<StatusState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) return { error: "Missing request id." };
  if (!isCustomRequestStatus(status)) return { error: "That is not a status we use." };

  try {
    await setCustomRequestStatus(id, status);
  } catch (error) {
    console.error("Could not set a custom request's status", error);
    return { error: "Could not save that. Check your connection and try again." };
  }

  revalidatePath("/admin/custom-requests");
  revalidatePath(`/admin/custom-requests/${id}`);
  return { savedAt: Date.now() };
}
