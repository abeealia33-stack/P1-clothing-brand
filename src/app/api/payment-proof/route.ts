import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { attachPaymentProof, getOrder } from "@/lib/orders-db";
import { clientKey, createRateLimit } from "@/lib/rate-limit";
import { isTransferMethod } from "@/lib/types";
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  storeUpload,
  UploadFailedError,
} from "@/lib/uploads";

/**
 * A customer sending in the screenshot of their bank or wallet transfer.
 *
 * This is the one upload on the site that is not behind the admin login, so
 * it is fenced three ways: the browser must hold the cookie for that exact
 * order (the same proof the confirmation page asks for), the order must be
 * one that is actually awaiting a transfer, and uploads are rate limited per
 * address. Only images, and only small ones.
 */

const proofLimit = createRateLimit(6, 10 * 60 * 1000);

export async function POST(request: Request) {
  if (!proofLimit.take(await clientKey())) {
    return NextResponse.json(
      { error: "Too many uploads just now. Try again in a few minutes." },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "That upload was not readable." }, { status: 400 });
  }

  const orderId = String(form.get("orderId") ?? "");
  const file = form.get("file");

  /* The same gate the confirmation page uses: only the browser that placed
     the order can attach anything to it. */
  const store = await cookies();
  if (!orderId || store.get("bilques_order")?.value !== orderId) {
    return NextResponse.json(
      { error: "We cannot match that to your order. Send it on WhatsApp instead." },
      { status: 403 }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was attached." }, { status: 400 });
  }
  if (!IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Send a screenshot or photo — JPG, PNG or WebP." },
      { status: 415 }
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "That image is over 8 MB. A screenshot is usually far smaller." },
      { status: 413 }
    );
  }

  const order = await getOrder(orderId);
  if (!order || !isTransferMethod(order.payment)) {
    return NextResponse.json(
      { error: "That order is not waiting on a transfer." },
      { status: 400 }
    );
  }

  let url: string;
  try {
    url = await storeUpload(file, "image", "bilques/receipts");
  } catch (error) {
    console.error("Payment proof upload failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof UploadFailedError
            ? "We could not save that image. Send it on WhatsApp instead."
            : "Something went wrong saving that. Try again.",
      },
      { status: 502 }
    );
  }

  /* Already settled by the owner: the money is in, and overwriting the record
     with a late upload would only muddy it. The customer is told it is done
     rather than shown an error. */
  const attached = await attachPaymentProof(orderId, url);
  if (!attached) {
    return NextResponse.json({ url, alreadyConfirmed: true });
  }

  return NextResponse.json({ url });
}
