import type { Metadata } from "next";
import Link from "next/link";
import { instagramLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Account" };

/**
 * There are no customer accounts in v1 — orders are looked up by phone number
 * or order ID. So this tab is the everything-else drawer: tracking, policy,
 * and the two channels the brand actually sells on.
 */
const links = [
  {
    href: "/track",
    title: "Track your order",
    note: "Look it up with your order ID or mobile number",
  },
  {
    href: "/shipping",
    title: "Shipping and returns",
    note: "Delivery times, exchanges, and how cash on delivery works",
  },
  {
    href: "/shipping#sizes",
    title: "Size guide",
    note: "Measurements in inches, and how each collection is cut",
  },
  {
    href: "/about",
    title: "About Bilques",
    note: "Who makes this and why",
  },
  {
    href: "/contact",
    title: "Contact",
    note: "WhatsApp, Instagram and email",
  },
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-[2.25rem] md:text-[3.5rem]">Your orders</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        No sign-up here. Everything is tied to the mobile number you order with,
        so there is one less password to keep.
      </p>

      <Link href="/track" className="btn btn-ink mt-7 w-full">
        Track an order
      </Link>

      <ul className="mt-10">
        {links.map((link) => (
          <li key={link.href} className="rule">
            <Link href={link.href} className="block py-4">
              <span className="block text-xl">{link.title}</span>
              <span
                className="mt-0.5 block text-sm"
                style={{ color: "var(--color-ink-soft)" }}
              >
                {link.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={whatsappLink()} className="btn btn-sage">
          WhatsApp us
        </a>
        <a href={instagramLink} className="btn btn-quiet">
          Follow on Instagram
        </a>
      </div>
    </div>
  );
}
