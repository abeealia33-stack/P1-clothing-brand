"use server";

import { cookies } from "next/headers";
import { createCustomRequest } from "@/lib/custom-requests-db";
import { checkCustomRequest } from "@/lib/custom-request";
import { clientKey, createRateLimit } from "@/lib/rate-limit";
import { getProductBySlug } from "@/lib/catalogue";

const requestLimit = createRateLimit(5, 10 * 60 * 1000);

export type CustomRequestResult =
  | { ok: true; requestId: string }
  | { ok: false; errors: Record<string, string> };

/**
 * Submits a request for a piece made to the customer's own measurements.
 *
 * Nothing is charged here — this only records what was asked for, so the
 * owner can follow up. The style is re-looked-up rather than trusted from the
 * browser, same reasoning as re-pricing a cart at checkout.
 */
export async function submitCustomRequestAction(input: {
  styleSlug: string;
  measurements: Record<string, string>;
  notes: string;
  name: string;
  phone: string;
  city: string;
}): Promise<CustomRequestResult> {
  const errors: Record<string, string> = {};

  const key = await clientKey();
  if (!requestLimit.take(key)) {
    const wait = Math.ceil(requestLimit.retryAfter(key) / 60);
    return {
      ok: false,
      errors: {
        form: `That is a lot of requests at once. Try again in ${wait} ${
          wait === 1 ? "minute" : "minutes"
        }, or message us on WhatsApp.`,
      },
    };
  }

  const style = await getProductBySlug(input.styleSlug);
  if (!style) {
    errors.style = "Pick a style to base your piece on.";
  }

  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const city = input.city?.trim() ?? "";
  const notes = input.notes?.trim() ?? "";

  // The same rules the form applied, so a shopper is never told two different
  // things about one field depending on which side caught it.
  const checked = checkCustomRequest({ name, phone, measurements: input.measurements });
  Object.assign(errors, checked.errors);

  if (Object.keys(errors).length > 0 || !checked.measurements) {
    return { ok: false, errors };
  }

  const request = await createCustomRequest({
    styleProductId: style!.id,
    styleName: style!.name,
    stylePhoto: style!.photos[0] ?? "",
    measurements: checked.measurements,
    notes: notes || undefined,
    name,
    phone,
    city: city || undefined,
  });

  const store = await cookies();
  store.set("bilques_custom_request", request.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { ok: true, requestId: request.id };
}
