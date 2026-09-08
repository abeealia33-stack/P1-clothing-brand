import Link from "next/link";
import type { ResolvedCollection } from "@/lib/types";
import { instagramLink, site, whatsappLink } from "@/lib/site";
import { rupees } from "@/lib/format";

export default function SiteFooter({
  collections,
}: {
  collections: ResolvedCollection[];
}) {
  return (
    <footer
      className="rule mt-24"
      style={{ background: "var(--color-khaddar)" }}
    >
      <div className="mx-auto max-w-6xl px-5 py-14">
        <p
          className="urdu text-2xl"
          style={{ color: "var(--color-sage-deep)" }}
        >
          آرام سے تیار
        </p>
        <p className="measure mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Ready with comfort. Made in Pakistan, sold from Lahore.
        </p>

        <div className="mt-10 grid gap-8 text-sm sm:grid-cols-3">
          {collections.length > 0 && (
            <nav aria-label="Collections">
              <h2 className="text-xl">Collections</h2>
              <ul className="mt-1">
                {collections.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop?collection=${c.slug}`}
                      style={{ color: "var(--color-ink-soft)" }}
                      className="block py-2 hover:text-ink"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <nav aria-label="Help">
            <h2 className="text-xl">Help</h2>
            <ul className="mt-1">
              {[
                ["/shipping", "Shipping and returns"],
                ["/track", "Track your order"],
                ["/about", "About Bilques"],
                ["/contact", "Contact us"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{ color: "var(--color-ink-soft)" }}
                    className="block py-2 hover:text-ink"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xl">Talk to us</h2>
            <ul className="mt-1">
              <li>
                <a
                  href={whatsappLink("Salam! I have a question about an order.")}
                  style={{ color: "var(--color-ink-soft)" }}
                  className="block py-2 hover:text-ink"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={instagramLink}
                  style={{ color: "var(--color-ink-soft)" }}
                  className="block py-2 hover:text-ink"
                >
                  Instagram
                </a>
              </li>
              <li className="py-2" style={{ color: "var(--color-ink-soft)" }}>
                {site.email}
              </li>
            </ul>
          </div>
        </div>

        <p
          className="rule tnum mt-10 pt-6 text-xs"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Cash on delivery across Pakistan. Free shipping over PKR{" "}
          {rupees(site.freeShippingOver)}. © {new Date().getFullYear()} {site.name}.
        </p>
      </div>
    </footer>
  );
}
