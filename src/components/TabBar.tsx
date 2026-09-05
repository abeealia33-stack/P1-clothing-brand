"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CartCount from "./CartCount";
import { useCart } from "./useCart";

/* Thin-stroke icons drawn to match the hairlines used elsewhere on the site,
   rather than a pulled-in icon set with a different weight and personality. */
const icons = {
  home: (
    <path d="M3 9.6 10 4l7 5.6V16a1 1 0 0 1-1 1h-3.4v-4.2H7.4V17H4a1 1 0 0 1-1-1Z" />
  ),
  shop: (
    <>
      <path d="M3.6 6.8h12.8L17 16.2a1 1 0 0 1-1 .9H4a1 1 0 0 1-1-.9Z" />
      <path d="M7.2 6.8V5.4a2.8 2.8 0 0 1 5.6 0v1.4" />
    </>
  ),
  search: (
    <>
      <circle cx="9.2" cy="9.2" r="5.2" />
      <path d="m13.2 13.2 3.4 3.4" />
    </>
  ),
  cart: (
    <>
      <path d="M2.6 4h2.1l2 8.9h8.1l1.7-6.6H5.6" />
      <circle cx="8.4" cy="16.2" r="1.2" />
      <circle cx="14.2" cy="16.2" r="1.2" />
    </>
  ),
  account: (
    <>
      <circle cx="10" cy="7" r="3.1" />
      <path d="M3.9 17c.5-3.2 3.1-4.8 6.1-4.8s5.6 1.6 6.1 4.8" />
    </>
  ),
};

const tabs = [
  { href: "/", label: "Home", icon: "home" as const },
  { href: "/shop", label: "Shop", icon: "shop" as const },
  { href: "/search", label: "Search", icon: "search" as const },
  { href: "/cart", label: "Cart", icon: "cart" as const },
  { href: "/account", label: "Account", icon: "account" as const },
];

export default function TabBar() {
  const pathname = usePathname();
  const { count, ready } = useCart();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="flex h-15 flex-col items-center justify-center gap-1 py-2 text-[0.6875rem] transition-colors"
                style={{ color: active ? "var(--color-ink)" : "var(--color-ink-soft)" }}
              >
                <span className="relative">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={active ? 1.6 : 1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {icons[tab.icon]}
                  </svg>
                  {tab.icon === "cart" && ready && count > 0 && (
                    <CartCount
                      count={count}
                      className="absolute -top-1.5 -right-2 min-w-4 rounded-full px-1 text-[0.625rem] leading-4 text-white"
                    />
                  )}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
