import Link from "next/link";
import FooterColumn from "./FooterColumn";
import type { ResolvedCollection } from "@/lib/types";
import { facebookLink, instagramLink, linkedinLink, site } from "@/lib/site";

const SOCIALS = [
  {
    label: "Bilques on Instagram",
    href: instagramLink,
    mark: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  {
    label: "Bilques on Facebook",
    href: facebookLink,
    mark: (
      <path d="M14 8.5h2.5V5.5H14c-2 0-3.5 1.5-3.5 3.5v2H8v3h2.5v7h3v-7H16l.5-3h-3V9c0-.3.2-.5.5-.5Z" />
    ),
  },
  {
    label: "Bilques on LinkedIn",
    href: linkedinLink,
    mark: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7.5 10.5v6M7.5 7.5v.01M11.5 16.5v-6M15.5 16.5v-3.2a2.3 2.3 0 0 0-4-1.4" />
      </>
    ),
  },
];

export default function SiteFooter({
  collections,
}: {
  collections: ResolvedCollection[];
}) {
  return (
    <footer className="footer rule mt-24">
      <div className="mx-auto max-w-7xl px-5 md:px-16">
        <div className="footer-grid">
          <div>
            <p className="urdu text-2xl" style={{ color: "var(--color-sage-deep)" }}>
              آرام سے تیار
            </p>
            <p className="footer-blurb">
              {site.tagline} — ready with comfort. Made in Pakistan, sold from
              Lahore.
            </p>
          </div>

          {/* The ranges as the owner keeps them: hiding one in the admin takes
              it out of here too, rather than leaving a link to an empty shop. */}
          <FooterColumn title="Shop">
            <FooterLink href="/shop">All pieces</FooterLink>
            {collections.map((c) => (
              <FooterLink key={c.slug} href={`/shop?collection=${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Help">
            <FooterLink href="/shipping">Shipping &amp; returns</FooterLink>
            <FooterLink href="/shipping#sizes">Size guide</FooterLink>
            <FooterLink href="/track">Track your order</FooterLink>
            <FooterLink href="/customize">Made to fit you</FooterLink>
          </FooterColumn>

          <FooterColumn title="Bilques">
            <FooterLink href="/about">About us</FooterLink>
            <FooterLink href="/about#promises">Our promises</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterColumn>
        </div>

        <div className="footer-bottom">
          <p className="tnum">
            © {new Date().getFullYear()} {site.name} · Lahore, Pakistan
          </p>

          <ul className="footer-social">
            {SOCIALS.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {social.mark}
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          <p>Cash on delivery · Easypaisa · JazzCash</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="footer-link">
        {children}
      </Link>
    </li>
  );
}
