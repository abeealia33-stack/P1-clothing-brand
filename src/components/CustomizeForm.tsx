"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ClothImage from "@/components/ClothImage";
import FormField from "@/components/FormField";
import { checkCustomRequest, measurementFields } from "@/lib/custom-request";
import { measurementRanges, type CustomMeasurements } from "@/lib/types";
import type { ProductChoice } from "@/lib/catalogue";
import { submitCustomRequestAction } from "@/app/(shop)/customize/actions";
import { whatsappLink } from "@/lib/site";

type Errors = Partial<
  Record<keyof CustomMeasurements | "style" | "name" | "phone" | "form", string>
>;

const STEPS = ["Pick a piece", "Measurements", "Your details"] as const;

/** Which step each field is asked on, so an error can send you back to it. */
const stepOf = (field: string): number =>
  field === "style" ? 0 : field === "name" || field === "phone" ? 2 : field === "form" ? 2 : 1;

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
  const [step, setStep] = useState(0);

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

  /* Errors are checked a step at a time, and a problem found at the end
     takes you back to the step it belongs to rather than a field you cannot
     see. */
  const showErrors = (found: Errors) => {
    setErrors(found);
    const first = Object.keys(found)[0];
    if (!first) return false;
    setStep(Math.min(...Object.keys(found).map(stepOf)));
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>("[data-error='true']")?.focus()
    );
    return true;
  };

  const next = () => {
    const found = Object.fromEntries(
      Object.entries(validate()).filter(([field]) => stepOf(field) <= step)
    ) as Errors;
    if (showErrors(found)) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      next();
      return;
    }
    if (showErrors(validate())) return;

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
      showErrors(result.errors);
      return;
    }

    router.push("/customize/submitted");
  };

  return (
    <form onSubmit={submit} noValidate className="mt-9">
      <ol className="grid grid-cols-3 gap-2" aria-label="Steps">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <div
              className="h-0.5 transition-colors"
              style={{ background: i <= step ? "var(--color-ink)" : "var(--color-line)" }}
            />
            <p
              className="mt-2 text-xs"
              style={{ color: i === step ? "var(--color-ink)" : "var(--color-ink-soft)" }}
            >
              {i + 1}. {label}
            </p>
          </li>
        ))}
      </ol>

      <fieldset className="mt-8 border-0 p-0" hidden={step !== 0}>
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

      <fieldset className="mt-8 border-0 p-0" hidden={step !== 1}>
        <legend className="text-2xl">Your measurements</legend>
        <MeasureGuide />
        <div className="mt-6 grid grid-cols-2 gap-5">
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

      <fieldset className="mt-8 border-0 p-0" hidden={step !== 2}>
        <legend className="text-2xl">Your details</legend>
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

      <div className="mt-9 flex items-center gap-5">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="text-sm underline underline-offset-4"
          >
            Back
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn btn-ink flex-1">
          {step < STEPS.length - 1 ? "Next" : submitting ? "Sending" : "Send my measurements"}
        </button>
      </div>
      <p className="mt-3 text-center text-sm" style={{ color: "var(--color-ink-soft)" }}>
        No payment yet — we call to agree a price first.
      </p>

      <p className="rule mt-8 pt-6 text-center text-sm">
        Not sure?{" "}
        <a
          href={whatsappLink("Salam! I'd like to book a 5-minute call about a custom piece.")}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Book a 5-minute call on WhatsApp
        </a>
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

/* Where each tape measurement goes, drawn once rather than described six
   times. Decorative for screen readers: every field is labelled already. */
function MeasureGuide() {
  const mark = { stroke: "var(--color-sage-deep)", strokeWidth: 1.5, strokeDasharray: "4 3" };
  const label = { fontSize: 9, fill: "var(--color-ink-soft)", fontFamily: "var(--font-body)" };
  return (
    <figure className="mt-5 flex items-center gap-5 border p-4" style={{ borderColor: "var(--color-line)" }}>
      <svg viewBox="0 0 150 200" className="h-44 w-auto shrink-0" aria-hidden="true">
        <path
          d="M60 18 Q75 30 90 18 L118 30 L140 110 L124 114 L108 58 L108 190 L42 190 L42 58 L26 114 L10 110 L32 30Z"
          fill="var(--color-khaddar)"
          stroke="var(--color-ink)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <line x1="32" y1="30" x2="118" y2="30" {...mark} />
        <text x="58" y="14" {...label}>shoulder</text>
        <line x1="44" y1="70" x2="106" y2="70" {...mark} />
        <text x="63" y="66" {...label}>chest</text>
        <line x1="44" y1="120" x2="106" y2="120" {...mark} />
        <text x="63" y="116" {...label}>waist</text>
        <line x1="118" y1="32" x2="138" y2="108" {...mark} />
        <text x="120" y="126" {...label}>sleeve</text>
      </svg>
      <figcaption className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
        Measure over light clothes with a soft tape, snug but not tight. Chest
        and waist go all the way round; sleeve runs from the shoulder seam to
        the wrist.
      </figcaption>
    </figure>
  );
}
