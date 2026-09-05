import type { Metadata } from "next";
import Link from "next/link";
import { instagramLink, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Message Bilques on WhatsApp or Instagram for sizing help, order updates and exchanges.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-5xl md:text-6xl">Talk to us</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        A real person answers, usually within a couple of hours between 11am and
        9pm.
      </p>

      {/* WhatsApp first and largest: it is how most of this audience already
          shops, and it is the channel the owner actually watches. */}
      <div className="mt-9 space-y-3">
        <a
          href={whatsappLink("Salam! I have a question about Bilques.")}
          className="block p-6 transition-colors"
          style={{ background: "var(--color-sage)", color: "#fff" }}
        >
          <span className="block text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            WhatsApp
          </span>
          <span className="tnum mt-1 block text-sm text-white/85">
            +92 300 1234567 — sizing, orders, exchanges
          </span>
        </a>

        <a
          href={instagramLink}
          className="block border p-6"
          style={{ borderColor: "var(--color-line)" }}
        >
          <span className="block text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Instagram
          </span>
          <span className="mt-1 block text-sm" style={{ color: "var(--color-ink-soft)" }}>
            @{site.instagram} — new pieces, restocks, and what fits whom
          </span>
        </a>

        <a
          href={`mailto:${site.email}`}
          className="block border p-6"
          style={{ borderColor: "var(--color-line)" }}
        >
          <span className="block text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Email
          </span>
          <span className="mt-1 block text-sm" style={{ color: "var(--color-ink-soft)" }}>
            {site.email} — for anything that needs a paper trail
          </span>
        </a>
      </div>

      <section className="rule mt-10 pt-8">
        <h2 className="text-3xl">Before you message</h2>
        <p className="measure mt-3 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          These two answer most of what we get asked, faster than we can reply.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/track" className="btn btn-quiet">
            Where is my order
          </Link>
          <Link href="/shipping#sizes" className="btn btn-quiet">
            Which size am I
          </Link>
        </div>
      </section>
    </div>
  );
}
