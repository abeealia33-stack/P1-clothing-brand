import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();

  const { saved } = await searchParams;
  const { heroImages, payments } = await getSettings();

  return (
    <div className="py-8">
      <h1 className="text-4xl">Settings</h1>
      <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        The photo at the top of the home page, and the accounts customers
        pay into. The banners further down have their own page.
      </p>

      {saved && (
        <p
          role="status"
          className="mt-4 border-l-2 py-2 pl-3 text-sm"
          style={{ borderColor: "var(--color-sage)" }}
        >
          Saved. The home page is updated.
        </p>
      )}

      <SettingsForm heroImages={heroImages} payments={payments} />
    </div>
  );
}
