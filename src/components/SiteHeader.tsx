"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ResolvedCollection } from "@/lib/types";
import CartCount from "./CartCount";
import { useCart } from "./useCart";
import { useWishlist } from "./useWishlist";

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

/* Same hairline weight as the rest of the header marks. */
function HeartIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.3s-7.5-4.6-7.5-9.4A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 7.5 2.9c0 4.8-7.5 9.4-7.5 9.4Z" />
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
export default function SiteHeader({
  collections,
}: {
  collections: ResolvedCollection[];
}) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const { count: saved, ready: savedReady } = useWishlist();
  const onHome = pathname === "/";
  const bar = useRef<HTMLElement>(null);
  const overHero = useOverHero(onHome, bar);

  return (
    /* Over the hero the bar is nothing but its words and marks, so the
       photograph runs the full height of the screen behind them. It takes on
       paper and its hairline the moment the page body rises to meet it —
       without that, everything scrolling underneath would read through it. */
    <header
      ref={bar}
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        overHero ? "" : "border-b border-line"
      } ${onHome ? (overHero ? "" : "bg-paper/80 backdrop-blur-md") : "bg-paper"}`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-5 md:px-16 md:h-16">
        <Link href="/" className="shrink-0">
          <span className="brand-mark">Bilques</span>
          <span className="brand-urdu urdu">آرام سے تیار</span>
        </Link>

        {/* The ranges, then the ways of buying that are not ranges. Dropped
            entirely when every collection is hidden, rather than left as an
            empty list taking up the middle of the header. */}
        {collections.length > 0 && (
          <nav aria-label="Collections" className="ml-auto hidden md:block">
            <ul className="flex items-center gap-7">
              {collections.map((c) => (
                <li key={c.slug}>
                  <Link href={`/shop?collection=${c.slug}`} className="nav-link">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/customize" className="nav-link">
                  Made to measure
                </Link>
              </li>
            </ul>
          </nav>
        )}

        {/* Search, account and cart: always at the right edge, on a phone as
            much as on desktop, everything else untouched. With no collections
            above, this is what pushes them there on desktop too. */}
        <div
          className={`ml-auto flex items-center gap-1 ${
            collections.length > 0 ? "md:ml-0" : ""
          }`}
        >
          <Link
            href="/search"
            aria-label="Search"
            className="icon-tap flex items-center justify-center rounded-full transition-colors hover:text-ink"
            style={{ color: "var(--color-ink-soft)" }}
          >
            <SearchIcon />
          </Link>
          <Link
            href="/wishlist"
            aria-label={`Saved${savedReady && saved > 0 ? `, ${saved} piece${saved === 1 ? "" : "s"}` : ""}`}
            className="icon-tap relative flex items-center justify-center rounded-full transition-colors hover:text-ink"
            style={{ color: "var(--color-ink-soft)" }}
          >
            <HeartIcon />
            {savedReady && saved > 0 && (
              <CartCount
                count={saved}
                className="absolute top-0.5 right-0.5 min-w-4 rounded-full px-1 text-[0.625rem] leading-4 text-white"
              />
            )}
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

/**
 * True while the home page's hero is still behind the bar.
 *
 * Measured against the hero's own height rather than a fixed distance, so it
 * holds whatever the photograph is cropped to and wherever the bar sits —
 * and it is simply false on every other page, which has no hero to sit over.
 */
function useOverHero(onHome: boolean, bar: React.RefObject<HTMLElement | null>) {
  // Tracked rather than derived so leaving the home page needs no reset:
  // the answer below is only ever true while the hero is there to sit over.
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!onHome) return;

    const hero = document.querySelector<HTMLElement>(".fold-hero");
    if (!hero) return;

    /* Measured on resize rather than on scroll: reading offsetHeight makes
       the browser recalculate layout there and then, and asking it to do
       that on every scroll event is how a sticky bar starts to stutter.
       Neither height changes as the page scrolls. */
    let reach = 0;
    const check = () => setPastHero(window.scrollY >= reach);
    const measure = () => {
      reach = hero.offsetHeight - (bar.current?.offsetHeight ?? 0);
      check();
    };

    measure();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", measure);
    };
  }, [onHome, bar]);

  return onHome && !pastHero;
}
