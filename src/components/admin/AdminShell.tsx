"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminNav } from "@/lib/admin-nav";
import { signOutAction } from "@/app/admin/actions";
import { AdminIcon } from "./AdminIcon";

/** True for the item's own route and anything nested under it. */
function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-bg lg:flex" style={{ background: "var(--color-admin-bg)", minHeight: "100vh" }}>
      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 -translate-x-full flex-col transition-transform duration-200 lg:static lg:translate-x-0"
        style={{
          background: "var(--color-admin-sidebar)",
          transform: open ? "translateX(0)" : undefined,
        }}
      >
        <Link
          href="/admin"
          className="flex h-14 shrink-0 items-center px-5 text-lg"
          style={{ fontFamily: "var(--font-display)", color: "#fff" }}
          onClick={() => setOpen(false)}
        >
          Bilques
        </Link>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          {adminNav.map((group) => (
            <div key={group.label}>
              <p
                className="px-3 text-[0.6875rem] font-medium tracking-[0.08em] uppercase"
                style={{ color: "var(--color-admin-sidebar-ink-soft)" }}
              >
                {group.label}
              </p>
              <ul className="mt-2 space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[0.8125rem] transition-colors"
                        style={{
                          background: active ? "var(--color-admin-sidebar-active)" : "transparent",
                          color: active ? "#fff" : "var(--color-admin-sidebar-ink)",
                        }}
                      >
                        <AdminIcon name={item.icon} className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className="shrink-0 space-y-1 px-3 py-4"
          style={{ borderTop: "1px solid var(--color-admin-sidebar-line)" }}
        >
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
            style={{ color: "var(--color-admin-sidebar-ink-soft)" }}
          >
            View shop
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm"
              style={{ color: "var(--color-admin-sidebar-ink-soft)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header
          className="sticky top-0 z-20 flex h-14 items-center gap-3 px-4 sm:px-6"
          style={{ background: "var(--color-admin-bg)" }}
        >
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex size-9 shrink-0 items-center justify-center rounded-md lg:hidden"
            style={{ background: "var(--color-admin-card)", boxShadow: "var(--shadow-admin-card)" }}
          >
            <AdminIcon name="menu" className="size-5" style={{ color: "var(--color-admin-ink)" }} />
          </button>

          <form action="/admin/products" className="min-w-0 flex-1">
            <div
              className="flex h-9 max-w-sm items-center gap-2 rounded-md px-3"
              style={{ background: "var(--color-admin-card)", boxShadow: "var(--shadow-admin-card)" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-admin-ink-soft)"
                strokeWidth={1.8}
                className="size-4 shrink-0"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                name="q"
                placeholder="Search products…"
                className="w-full min-w-0 bg-transparent text-sm outline-none"
                style={{ color: "var(--color-admin-ink)" }}
              />
            </div>
          </form>

          <Link
            href="/admin/products/new"
            className="ml-auto flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-[0.8125rem] font-medium whitespace-nowrap"
            style={{ background: "var(--color-admin-ink)", color: "#fff" }}
          >
            <span aria-hidden="true">+</span> Add product
          </Link>
        </header>

        <main className="px-4 pb-16 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
