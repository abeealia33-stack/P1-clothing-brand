"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setOrderStatus, setPaymentStatus } from "@/lib/orders-db";
import { isOrderStatus, isPaymentStatus } from "@/lib/types";

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
  } catch (error) {
    console.error("Could not set an order's status", error);
    return { error: "Could not save that. Check your connection and try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { savedAt: Date.now() };
}

/**
 * Says whether the money arrived. Only the owner can decide this — a customer
 * uploading a receipt moves an order to "review" and no further, so nothing a
 * shopper does can mark their own order paid.
 */
export async function setPaymentStatusAction(
  _previous: StatusState,
  formData: FormData
): Promise<StatusState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");

  if (!id) return { error: "Missing order number." };
  if (!isPaymentStatus(paymentStatus)) {
    return { error: "That is not a payment state we use." };
  }

  try {
    await setPaymentStatus(id, paymentStatus);
  } catch (error) {
    console.error("Could not set an order's payment status", error);
    return { error: "Could not save that. Check your connection and try again." };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { savedAt: Date.now() };
}
