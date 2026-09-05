"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setOrderStatus } from "@/lib/orders-db";
import { isOrderStatus } from "@/lib/types";

export type StatusState = { error?: string; savedAt?: number };

/**
 * Moves an order along. Called from a form, so it re-checks the session: a
 * server action answers any POST that reaches it, whatever the proxy allowed.
 */
export async function setStatusAction(
  _previous: StatusState,
  formData: FormData
): Promise<StatusState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) return { error: "Missing order number." };
  if (!isOrderStatus(status)) return { error: "That is not a status we use." };

  try {
    await setOrderStatus(id, status);
  } catch {
    return { error: "Could not save that. Check your connection and try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { savedAt: Date.now() };
}
