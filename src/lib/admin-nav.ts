/**
 * Single source of truth for the admin sidebar. Kept to routes that
 * actually exist today — nothing links to a feature that isn't built yet.
 * The two that edit what's live on the home page sit together under Site:
 * the banners further down it, and the settings that hold the hero.
 */

export type AdminIconName =
  | "grid"
  | "bag"
  | "shirt"
  | "tag"
  | "layers"
  | "reel"
  | "ruler"
  | "menu"
  | "settings"
  | "image"
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
      { label: "Custom requests", href: "/admin/custom-requests", icon: "ruler" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Products", href: "/admin/products", icon: "shirt" },
      { label: "Collections", href: "/admin/collections", icon: "layers" },
      { label: "Categories", href: "/admin/categories", icon: "tag" },
      { label: "Reels", href: "/admin/reels", icon: "reel" },
    ],
  },
  {
    label: "Site",
    items: [
      { label: "Home banners", href: "/admin/banners", icon: "image" },
      { label: "Site settings", href: "/admin/settings", icon: "settings" },
    ],
  },
];
