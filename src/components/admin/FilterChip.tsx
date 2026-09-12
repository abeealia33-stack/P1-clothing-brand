import Link from "next/link";

/** One option in an admin list's status filter — the same pill in every list. */
export default function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className="flex h-9 items-center rounded-md px-3 text-[0.8125rem] whitespace-nowrap"
      style={
        active
          ? { background: "var(--color-admin-ink)", color: "#fff" }
          : {
              background: "var(--color-admin-card)",
              color: "var(--color-admin-ink-soft)",
              boxShadow: "var(--shadow-admin-card)",
            }
      }
    >
      {children}
    </Link>
  );
}
