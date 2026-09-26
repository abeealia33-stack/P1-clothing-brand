import type { Metadata } from "next";
import Link from "next/link";
import { rupees } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms you buy under at Bilques: pricing, when an order is agreed, delivery, exchanges, custom pieces and how to reach us.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-[2.25rem] md:text-[3.5rem]">Terms</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        What you are agreeing to when you order from us, in the same plain
        words we use everywhere else.
      </p>

      <section className="rule mt-10 pt-8">
        <h2 className="text-3xl">Who you are buying from</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            {site.name} is a clothing business operating from Lahore, Pakistan,
            selling within Pakistan. You can reach us at{" "}
            <a href={`mailto:${site.email}`} className="underline underline-offset-4">
              {site.email}
            </a>{" "}
            or on WhatsApp at {site.whatsappDisplay}.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Orders and prices</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            Prices are in Pakistani rupees and include no hidden charges.
            Shipping is PKR 250, or free once your order passes PKR{" "}
            {rupees(site.freeShippingOver)}.
          </p>
          <p>
            Placing an order is an offer to buy, not a completed sale. We
            confirm by phone before the parcel goes to the courier, and the sale
            is agreed at that point. Until then either of us can call it off.
          </p>
          <p>
            Pieces are made in small runs and can sell out while something sits
            in a cart. If we cannot fulfil what you ordered we will tell you and
            take nothing for it.
          </p>
          <p style={{ color: "var(--color-ink-soft)" }}>
            We try hard to describe colour and fabric accurately, but a
            photograph on your screen is not a perfect match for cloth in
            daylight. If a piece is not as described, that is covered by the
            exchange terms below.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Paying</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            Cash on delivery is the default: nothing is charged before the
            parcel reaches you. Bank transfer, JazzCash and EasyPaisa are also
            accepted, and we send the account details once your order is
            confirmed. Card payment is not available yet.
          </p>
          <p>
            Where you pay in advance and we cannot fulfil the order, you get the
            full amount back by the same route.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Delivery, exchanges and refunds</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            Delivery times, the exchange window and what we do about a faulty
            piece are set out in full on the{" "}
            <Link href="/shipping" className="underline underline-offset-4">
              shipping and returns
            </Link>{" "}
            page, and those terms form part of these. In short: exchange an
            unworn, unwashed piece within seven days of delivery, and if
            something arrives faulty or wrong we cover the shipping both ways
            and either replace it or refund you in full.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Pieces made to fit</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            A custom request is a request for a quote, not an order. Nothing is
            charged and nothing is cut until we have spoken to you and agreed a
            price.
          </p>
          <p>
            Because a made-to-measure piece is cut to numbers you give us, it
            cannot be exchanged for fit once made. Check your measurements
            carefully, and ask us if you are unsure — we would much rather take
            the call. A custom piece that is faulty or not what was agreed is
            our problem to fix, same as anything else.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Using this site</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            The photographs, writing and design here are ours. Please do not
            reuse them commercially without asking. Do not attempt to break,
            overload or gain unauthorised access to any part of the site.
          </p>
          <p style={{ color: "var(--color-ink-soft)" }}>
            These terms are governed by the laws of Pakistan. How we handle your
            details is set out in our{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              privacy notice
            </Link>
            . If we change these terms, the version on this page at the time you
            order is the one that applies.
          </p>
        </div>
      </section>
    </div>
  );
}
