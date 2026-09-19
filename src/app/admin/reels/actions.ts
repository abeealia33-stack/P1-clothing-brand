"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getProductById } from "@/lib/catalogue";
import {
  createReel,
  deleteReel,
  getReelById,
  reorderReel,
  updateReel,
  type ReelInput,
} from "@/lib/reels";

export type ReelFormState = { errors?: Record<string, string> };

async function readForm(
  formData: FormData
): Promise<{ input?: ReelInput; errors: Record<string, string> }> {
  const errors: Record<string, string> = {};

  const video = String(formData.get("video") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!video) errors.video = "Upload a video for the reel.";
  if (!productId) {
    errors.productId = "Choose which piece this video is for.";
  } else if (!(await getProductById(productId))) {
    errors.productId = "That piece could not be found.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    input: {
      video,
      poster: null,
      caption: caption || null,
      productId,
      active,
    },
  };
}

function refreshReels() {
  revalidatePath("/");
  revalidatePath("/admin/reels");
}

export async function createReelAction(
  _previous: ReelFormState,
  formData: FormData
): Promise<ReelFormState> {
  await requireAdmin();

  const { input, errors } = await readForm(formData);
  if (!input) return { errors };

  try {
    await createReel(input);
  } catch (error) {
    console.error("Could not add a reel", error);
    return { errors: { form: "Could not save that reel. Try again." } };
  }

  refreshReels();
  redirect("/admin/reels?saved=1");
}

export async function updateReelAction(
  _previous: ReelFormState,
  formData: FormData
): Promise<ReelFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { errors: { form: "Missing reel." } };

  const { input, errors } = await readForm(formData);
  if (!input) return { errors };

  try {
    await updateReel(id, input);
  } catch (error) {
    console.error("Could not save a reel", error);
    return { errors: { form: "Could not save that reel. Try again." } };
  }

  refreshReels();
  redirect("/admin/reels?saved=1");
}

export async function deleteReelAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteReel(id);
    refreshReels();
  }
  redirect("/admin/reels?deleted=1");
}

export async function toggleReelAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = id ? await getReelById(id) : null;
  if (!existing) redirect("/admin/reels");

  await updateReel(id, {
    video: existing.video,
    poster: existing.poster,
    caption: existing.caption,
    productId: existing.productId,
    active: !existing.active,
  });
  refreshReels();
  redirect("/admin/reels");
}

export async function moveReelAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (id && (direction === "up" || direction === "down")) {
    await reorderReel(id, direction);
    refreshReels();
  }
  redirect("/admin/reels");
}
