import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Bilques asks you for, why, who else sees it, and how to have it deleted. No tracking, no advertising pixels, no accounts.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-[2.25rem] md:text-[3.5rem]">Privacy</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        What we ask you for, why we ask, and how to have it deleted. Short,
        because we collect very little.
      </p>

      <section className="rule mt-10 pt-8">
        <h2 className="text-3xl">The short version</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            There are no accounts, no advertising pixels and no analytics on
            this site. Nobody is following you around the internet on our
            behalf. We ask for what it takes to get a parcel to your door and
            nothing else.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">What we hold</h2>
        <dl className="measure mt-4 space-y-5 text-[1.0625rem] leading-[1.7]">
          <div>
            <dt className="font-medium">When you place an order</dt>
            <dd style={{ color: "var(--color-ink-soft)" }}>
              Your name, mobile number, delivery address, city and any note you
              leave for the courier, along with what you bought and what it
              cost. We need every one of these to deliver and to call you if
              something is unclear.
            </dd>
          </div>
          <div>
            <dt className="font-medium">When you pay by transfer</dt>
            <dd style={{ color: "var(--color-ink-soft)" }}>
              If you send a screenshot of a bank, JazzCash or EasyPaisa
              transfer, we keep that image against your order so we can check
              the money arrived. We never see or store your card or banking
              login details — there is no card gateway on this site.
            </dd>
          </div>
          <div>
            <dt className="font-medium">When you ask for a piece made to fit</dt>
            <dd style={{ color: "var(--color-ink-soft)" }}>
              Your measurements, name, mobile number and city. These are used to
              quote and to cut the piece, and for nothing else.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Your cart and saved pieces</dt>
            <dd style={{ color: "var(--color-ink-soft)" }}>
              These stay in your own browser and are never sent to us. Clearing
              your browser data clears them. They do not follow you to another
              phone, and we cannot see them.
            </dd>
          </div>
        </dl>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Cookies</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            Three, all of them doing a job rather than watching you. One keeps
            the shop owner signed in to the admin, one holds the second step of
            that sign-in, and one remembers that this browser placed a
            particular order so it can show you the confirmation. There are no
            advertising or analytics cookies, so there is no banner to dismiss.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Who else sees it</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            The courier gets your name, address and phone number, because that
            is how a parcel arrives. Our hosting provider stores the site and
            its database, and our image host stores the photographs — including
            any transfer screenshot you send. Nobody buys this data and we do
            not sell or share it for marketing.
          </p>
          <p>
            If you message us on WhatsApp or Instagram, that conversation lives
            on their service under their terms, not ours.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">How long we keep it</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            Orders are kept as a business record so we can honour exchanges and
            answer questions about a past purchase. Custom design requests are
            kept while we are talking to you about them. Ask us to delete either
            and we will, unless we are required to keep the record of a
            completed sale.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Asking us to change or delete it</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            Write to{" "}
            <a
              href={`mailto:${site.email}`}
              className="underline underline-offset-4"
            >
              {site.email}
            </a>{" "}
            or message us on WhatsApp and tell us what you want corrected or
            removed. We will need enough to find your order — the order number
            or the mobile number you used.
          </p>
          <p style={{ color: "var(--color-ink-soft)" }}>
            Questions about any of this go to the same address. See also{" "}
            <Link href="/terms" className="underline underline-offset-4">
              our terms
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
