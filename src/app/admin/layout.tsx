import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { isSignedIn } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Bilques admin" },
  // The owner's back office should never turn up in a search result.
  robots: { index: false, follow: false },
};

/**
 * Back of house.
 *
 * Deliberately a different room from the shop: its own dense, dark-sidebar
 * visual language rather than the storefront's chrome — this is a tool used
 * every day, not a window display. The login page (not signed in) renders
 * without the shell.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return (
      <div className="min-h-screen" style={{ background: "var(--color-paper)" }}>
        <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">{children}</main>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
