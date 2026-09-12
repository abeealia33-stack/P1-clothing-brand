"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ClothImage from "@/components/ClothImage";
import FormField from "@/components/FormField";
import { checkCustomRequest, measurementFields } from "@/lib/custom-request";
import { measurementRanges, type CustomMeasurements } from "@/lib/types";
import type { ProductChoice } from "@/lib/catalogue";
import { submitCustomRequestAction } from "@/app/(shop)/customize/actions";

type Errors = Partial<
  Record<keyof CustomMeasurements | "style" | "name" | "phone" | "form", string>
>;

export default function CustomizeForm({ products }: { products: ProductChoice[] }) {
  const router = useRouter();

  const [styleSlug, setStyleSlug] = useState<string>(products[0]?.slug ?? "");
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (products.length === 0) {
    return (
      <p className="measure mt-8" style={{ color: "var(--color-ink-soft)" }}>
        There is nothing in the shop to base a custom piece on right now.
        Message us on WhatsApp instead and we will sort it out directly.
      </p>
    );
  }

  /* The same rules the server action applies, so the wording a shopper sees
     does not depend on which side caught the mistake. */
  const validate = (): Errors => {
    const { errors } = checkCustomRequest({ name, phone, measurements });
    return {
      ...errors,
      ...(styleSlug ? {} : { style: "Pick a style to base your piece on." }),
    };
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>("[data-error='true']")?.focus();
      return;
    }

    setSubmitting(true);
    const result = await submitCustomRequestAction({
      styleSlug,
      measurements,
      notes,
      name,
      phone,
      city,
    });

    if (!result.ok) {
      setSubmitting(false);
      setErrors(result.errors);
      document.querySelector<HTMLElement>("[data-error='true']")?.focus();
      return;
    }

    router.push("/customize/submitted");
  };

  return (
    <form onSubmit={submit} noValidate className="mt-9">
      <fieldset className="border-0 p-0">
        <legend className="text-2xl">Start from a piece</legend>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {products.map((product) => {
            const on = styleSlug === product.slug;
            return (
              <label
                key={product.slug}
                className="block cursor-pointer border-2 transition-colors"
                style={{ borderColor: on ? "var(--color-ink)" : "transparent" }}
              >
                <input
                  type="radio"
                  name="style"
                  value={product.slug}
                  checked={on}
                  onChange={() => setStyleSlug(product.slug)}
                  className="sr-only"
                />
                <div className="aspect-[3/4] overflow-hidden">
                  <ClothImage src={product.photo} alt={product.name} />
                </div>
                <p className="mt-1 truncate text-xs">{product.name}</p>
              </label>
            );
          })}
        </div>
        {errors.style && (
          <p role="alert" className="mt-2 text-sm" style={{ color: "var(--color-alert)" }}>
            {errors.style}
          </p>
        )}
      </fieldset>

      <fieldset className="rule mt-9 border-0 p-0 pt-7">
        <legend className="text-2xl">Your measurements</legend>
        <div className="mt-5 grid grid-cols-2 gap-5">
          {measurementFields.map((field) => (
            <MeasurementField
              key={field}
              field={field}
              value={measurements[field] ?? ""}
              onChange={(v) => setMeasurements((m) => ({ ...m, [field]: v }))}
              error={errors[field]}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="rule mt-9 border-0 p-0 pt-7">
        <legend className="text-2xl">You</legend>
        <div className="mt-5 space-y-5">
          <FormField id="name" label="Your name" value={name} onChange={setName} error={errors.name} autoComplete="name" />
          <FormField
            id="phone"
            label="Mobile number"
            hint="We call to confirm before agreeing a price."
            value={phone}
            onChange={setPhone}
            error={errors.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0300 1234567"
          />
          <FormField id="city" label="City" value={city} onChange={setCity} autoComplete="address-level2" />
          <FormField
            id="notes"
            label="Anything else about what you want"
            hint="Optional — fabric, colour, collar style, anything to change from the piece above."
            value={notes}
            onChange={setNotes}
            multiline
          />
        </div>
      </fieldset>

      {errors.form && (
        <p role="alert" className="measure mt-6 border p-4 text-sm" style={{ borderColor: "var(--color-alert)", color: "var(--color-alert)" }}>
          {errors.form}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn btn-ink mt-9 w-full">
        {submitting ? "Sending" : "Send my measurements"}
      </button>
      <p className="mt-3 text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>
        No payment yet — we call to agree a price first.
      </p>
    </form>
  );
}

function MeasurementField({
  field,
  value,
  onChange,
  error,
}: {
  field: keyof CustomMeasurements;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const range = measurementRanges[field];
  return (
    <div>
      <label htmlFor={field} className="block text-sm font-medium">
        {range.label} <span style={{ color: "var(--color-ink-soft)" }}>({range.unit})</span>
      </label>
      <div className="mt-2">
        <input
          id={field}
          type="number"
          inputMode="decimal"
          value={value}
          min={range.min}
          max={range.max}
          step="0.5"
          aria-invalid={error ? true : undefined}
          data-error={error ? "true" : undefined}
          className="field"
          style={error ? { borderColor: "var(--color-alert)" } : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm" style={{ color: "var(--color-alert)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
