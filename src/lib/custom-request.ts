import { measurementRanges } from "./types";
import type { CustomMeasurements } from "./types";

/**
 * The rules a custom request has to satisfy, written once.
 *
 * The browser checks these so nobody waits on a round trip to be told their
 * phone number is short, and the server action checks them again because a
 * server action answers any POST that reaches it. Keeping both on this
 * function is what stops the two from drifting into giving different answers
 * — or different wording — for the same mistake.
 *
 * No server imports here: the form is a client component.
 */

export type CustomRequestFields = {
  name: string;
  phone: string;
  /** As typed, before they are known to be numbers. */
  measurements: Record<string, string>;
};

export type CustomRequestCheck = {
  errors: Record<string, string>;
  /** Present only when every measurement was within its range. */
  measurements?: CustomMeasurements;
};

export const measurementFields = Object.keys(
  measurementRanges
) as (keyof CustomMeasurements)[];

export function checkCustomRequest(input: CustomRequestFields): CustomRequestCheck {
  const errors: Record<string, string> = {};

  if (input.name.trim().length < 2) errors.name = "Tell us who to ask for.";

  const digits = input.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 12) {
    errors.phone = "Enter a Pakistani mobile number, like 0300 1234567.";
  }

  const measurements = {} as CustomMeasurements;
  for (const field of measurementFields) {
    const range = measurementRanges[field];
    const value = Number(input.measurements[field]);
    if (!Number.isFinite(value) || value < range.min || value > range.max) {
      errors[field] = `Between ${range.min} and ${range.max} ${range.unit}.`;
    } else {
      measurements[field] = value;
    }
  }

  return Object.keys(errors).length > 0 ? { errors } : { errors, measurements };
}
