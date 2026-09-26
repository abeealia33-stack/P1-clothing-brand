import type { Metadata } from "next";
import WishlistView from "./WishlistView";

export const metadata: Metadata = { title: "Saved" };

/**
 * The saved list lives in the shopper's own browser, so there is nothing for
 * the server to fetch — the page is a heading and a client view that reads
 * the list once it is there.
 */
export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-16 py-10 md:py-14">
      <h1 className="text-[2.25rem] md:text-[3.5rem]">Saved</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        Pieces you have kept for later. They stay in this browser — there is no
        sign-up here — so they will not follow you to another phone.
      </p>

      <WishlistView />
    </div>
  );
}
