"use server";

import { cookies, headers } from "next/headers";
import { createCustomRequest } from "@/lib/custom-requests-db";
import { createRateLimit } from "@/lib/rate-limit";
import { getProductBySlug } from "@/lib/catalogue";
import { measurementRanges } from "@/lib/types";
import type { CustomMeasurements } from "@/lib/types";

const requestLimit = createRateLimit(5, 10 * 60 * 1000);

/** Best-effort client identity behind Hostinger's proxy, as in checkout. */
async function clientKey(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

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

  if (name.length < 2) errors.name = "Tell us who to ask for.";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 12) {
    errors.phone = "Enter a Pakistani mobile number, like 0300 1234567.";
  }

  const measurements = {} as CustomMeasurements;
  for (const field of Object.keys(measurementRanges) as (keyof CustomMeasurements)[]) {
    const range = measurementRanges[field];
    const value = Number(input.measurements[field]);
    if (!Number.isFinite(value) || value < range.min || value > range.max) {
      errors[field] = `Enter your ${range.label.toLowerCase()} in ${range.unit}, between ${range.min} and ${range.max}.`;
    } else {
      measurements[field] = value;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const request = await createCustomRequest({
    styleProductId: style!.id,
    styleName: style!.name,
    stylePhoto: style!.photos[0] ?? "",
    measurements,
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
