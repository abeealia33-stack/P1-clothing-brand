import type { CustomRequestStatus } from "@/lib/types";

/** Colour carries meaning here, so it never carries it alone — the word is
 * always there too, same as the order status pill. */
const looks: Record<CustomRequestStatus, { label: string; bg: string; fg: string }> = {
  new: { label: "New", bg: "#5C6B58", fg: "#fff" },
  contacted: { label: "Contacted", bg: "#8B9E8B", fg: "#fff" },
  closed: { label: "Closed", bg: "transparent", fg: "#6B6055" },
};

export default function CustomRequestStatusPill({
  status,
}: {
  status: CustomRequestStatus;
}) {
  const look = looks[status] ?? looks.new;
  const outlined = look.bg === "transparent";

  return (
    <span
      className="shrink-0 px-2 py-0.5 text-[0.6875rem] whitespace-nowrap"
      style={{
        background: look.bg,
        color: look.fg,
        boxShadow: outlined ? `inset 0 0 0 1px ${look.fg}55` : undefined,
      }}
    >
      {look.label}
    </span>
  );
}
