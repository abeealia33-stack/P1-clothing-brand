/**
 * Single source of truth for the admin sidebar. Kept to routes that
 * actually exist today, plus Dashboard/Orders/Products/Categories and the
 * one settings page that already edits what's live on the storefront (the
 * hero images and promo banners) — nothing links to a feature that isn't
 * built yet.
 */

export type AdminIconName =
  | "grid"
  | "bag"
  | "shirt"
  | "tag"
  | "reel"
  | "menu"
  | "settings"
  /* Dashboard stat cards only — not sidebar entries. */
  | "banknote"
  | "users";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: AdminIconName;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const adminNav: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: "grid" },
      { label: "Orders", href: "/admin/orders", icon: "bag" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Products", href: "/admin/products", icon: "shirt" },
      { label: "Categories", href: "/admin/categories", icon: "tag" },
      { label: "Reels", href: "/admin/reels", icon: "reel" },
    ],
  },
  {
    label: "Site",
    items: [{ label: "Site settings", href: "/admin/settings", icon: "settings" }],
  },
];
