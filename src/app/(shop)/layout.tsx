import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TabBar from "@/components/TabBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSettings } from "@/lib/settings";
import { navCollections } from "@/lib/types";

/**
 * Everything a customer sees. The admin sits outside this group so it gets
 * none of the shop chrome — no bottom tab bar, no brand footer.
 *
 * The collections are read once here and handed to the header and footer,
 * which are client components and cannot reach the database themselves.
 */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collections } = await getSettings();
  const shown = navCollections(collections);

  return (
    <>
      <a
        href="#main"
        className="btn btn-ink sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60"
      >
        Skip to content
      </a>
      <SiteHeader collections={shown} />
      {/* Clears the fixed tab bar so nothing hides behind it on phones. */}
      <div className="pb-tabbar md:pb-0">
        <main id="main">{children}</main>
        <SiteFooter collections={shown} />
      </div>
      <WhatsAppButton />
      <div className="md:hidden">
        <TabBar />
      </div>
    </>
  );
}
