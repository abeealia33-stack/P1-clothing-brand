import type { AdminIconName } from "@/lib/admin-nav";

/**
 * The handful of line icons the admin chrome needs, kept as inline SVG
 * rather than an icon library dependency.
 */
const paths: Record<AdminIconName, React.ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  bag: (
    <>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  shirt: <path d="M8 4 4 7l2 3 2-1.4V20h8V8.6L18 10l2-3-4-3-2 2h-4L8 4Z" />,
  tag: (
    <>
      <path d="M11.5 3.5H5A1.5 1.5 0 0 0 3.5 5v6.5c0 .4.16.78.44 1.06l9 9c.58.58 1.53.58 2.12 0l7-7c.58-.58.58-1.53 0-2.12l-9-9a1.5 1.5 0 0 0-1.06-.44Z" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  reel: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M9 4v5" />
      <path d="m11 12.5 4 2.2-4 2.2v-4.4Z" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  banknote: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="1.5" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.7-3.4 3-5.3 5.5-5.3s4.8 1.9 5.5 5.3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.8 14.8c2.1.3 3.6 1.9 4.2 4.7" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 6.2l1.7 1.7M18.1 16.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 17.8l1.7-1.7M18.1 7.9l1.7-1.7" />
    </>
  ),
};

export function AdminIcon({
  name,
  className,
  style,
}: {
  name: AdminIconName;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
