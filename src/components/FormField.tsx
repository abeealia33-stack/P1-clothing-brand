"use client";

/**
 * One labelled field, used by every customer-facing form.
 *
 * It carries the conventions those forms share rather than leaving each one to
 * remember them: the hint and the error are tied to the input with
 * `aria-describedby`, and a field in error is marked `data-error` so the form
 * can put the cursor in the first thing that needs fixing.
 */
export default function FormField({
  id,
  label,
  hint,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  multiline = false,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  inputMode?: "tel" | "text" | "decimal";
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  const shared = {
    id,
    value,
    placeholder,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
    "data-error": error ? "true" : undefined,
    className: "field",
    style: error ? { borderColor: "var(--color-alert)" } : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {hint}
        </p>
      )}
      <div className="mt-2">
        {multiline ? (
          <textarea {...shared} rows={3} />
        ) : (
          <input {...shared} type={type} inputMode={inputMode} />
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm" style={{ color: "var(--color-alert)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
