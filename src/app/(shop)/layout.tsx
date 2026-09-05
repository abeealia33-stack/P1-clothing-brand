import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TabBar from "@/components/TabBar";

/**
 * Everything a customer sees. The admin sits outside this group so it gets
 * none of the shop chrome — no bottom tab bar, no brand footer.
 */
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="btn btn-ink sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60"
      >
        Skip to content
      </a>
      <SiteHeader />
      {/* Clears the fixed tab bar so nothing hides behind it on phones. */}
      <div className="pb-tabbar md:pb-0">
        <main id="main">{children}</main>
        <SiteFooter />
      </div>
      <div className="md:hidden">
        <TabBar />
      </div>
    </>
  );
}
