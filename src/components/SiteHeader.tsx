"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { collections } from "@/lib/types";
import CartCount from "./CartCount";
import { useCart } from "./useCart";

/* Same hairline weight and paths as the icons in TabBar, so the search and
   account marks read as one icon language whether they turn up at the top of
   the page or in the bottom tabs. */
function SearchIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9.2" cy="9.2" r="5.2" />
      <path d="m13.2 13.2 3.4 3.4" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="7" r="3.1" />
      <path d="M3.9 17c.5-3.2 3.1-4.8 6.1-4.8s5.6 1.6 6.1 4.8" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.6 4h2.1l2 8.9h8.1l1.7-6.6H5.6" />
      <circle cx="8.4" cy="16.2" r="1.2" />
      <circle cx="14.2" cy="16.2" r="1.2" />
    </svg>
  );
}

/* On phones this is a slim brand bar and nothing else — the bottom tabs do the
   navigating. From md up it takes on the collection links and the cart, since
   there is no tab bar at that width. */
export default function SiteHeader() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const onHome = pathname === "/";

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line ${
        onHome ? "bg-paper/80 backdrop-blur-md" : "bg-paper"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5 md:h-16">
        <Link href="/" className="flex items-baseline gap-2.5">
          <span
            className="text-[1.375rem] leading-none"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.01em" }}
          >
            Bilques
          </span>
          <span
            className="urdu hidden text-[0.8125rem] leading-none sm:inline"
            style={{ color: "var(--color-sage-deep)" }}
          >
            آرام سے تیار
          </span>
        </Link>

        <nav aria-label="Collections" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop?collection=${c.slug}`}
                  className="transition-colors hover:text-ink"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Search, account and cart: always at the right edge, on a phone as
            much as on desktop, everything else untouched. */}
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href="/search"
            aria-label="Search"
            className="icon-tap flex items-center justify-center rounded-full transition-colors hover:text-ink"
            style={{ color: "var(--color-ink-soft)" }}
          >
            <SearchIcon />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="icon-tap flex items-center justify-center rounded-full transition-colors hover:text-ink"
            style={{ color: "var(--color-ink-soft)" }}
          >
            <AccountIcon />
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart${ready && count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
            className="icon-tap relative flex items-center justify-center rounded-full transition-colors hover:text-ink"
            style={{ color: "var(--color-ink-soft)" }}
          >
            <CartIcon />
            {ready && count > 0 && (
              <CartCount
                count={count}
                className="absolute top-0.5 right-0.5 min-w-4 rounded-full px-1 text-[0.625rem] leading-4 text-white"
              />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
