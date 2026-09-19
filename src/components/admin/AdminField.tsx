/**
 * A labelled field in an admin form: the label, the hint under it in the
 * owner's own words, the control, and what is wrong with it.
 *
 * The product form and the reel form each had their own copy of this. They
 * are the two long forms in the admin, so they are also the two where a
 * rejected save has to be findable — which is what the wrapper id is for:
 * `FormErrors` links to it to scroll the right field into view.
 *
 * Kept apart from the shopper-side `FormField`, which is a controlled input
 * with its own value and onChange. These forms are uncontrolled and post to a
 * server action, so sharing one component would mean one that does neither
 * job plainly.
 */
export default function AdminField({
  id,
  label,
  hint,
  error,
  required = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /**
   * Says so on the label, for a field the browser cannot check itself.
   *
   * A plain input marked `required` is caught before the form is even sent,
   * with the browser pointing at it. The colours and the photos are pickers
   * that write to a hidden input, and hidden inputs are left out of that
   * check entirely — so nothing stopped a piece being sent with neither, and
   * the only word about it came back from the server. Saying it up front is
   * the half of the fix that happens before the mistake.
   */
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div id={`${id}-field`} className="mt-6 scroll-mt-6">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && (
          <span
            className="ml-2 text-xs font-normal"
            style={{ color: "var(--color-alert)" }}
          >
            Needed
          </span>
        )}
      </label>
      {hint && (
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm" style={{ color: "var(--color-alert)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
