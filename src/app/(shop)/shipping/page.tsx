import type { Metadata } from "next";
import Link from "next/link";
import { rupees } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping and returns",
  description:
    "Cash on delivery across Pakistan, free shipping over PKR 3,000, and seven-day exchanges on unworn pieces.",
};

const sizes = [
  { size: "S", bust: "36", waist: "30", hip: "38" },
  { size: "M", bust: "38", waist: "32", hip: "40" },
  { size: "L", bust: "40", waist: "34", hip: "42" },
  { size: "XL", bust: "43", waist: "37", hip: "45" },
];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <h1 className="text-[2.25rem] md:text-[3.5rem]">Shipping and returns</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        The whole policy, in the order people actually ask about it.
      </p>

      <section className="rule mt-10 pt-8">
        <h2 className="text-3xl">Paying</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            Cash on delivery is the default. You pay the courier when the parcel
            reaches you — nothing is charged before that, and you can cancel any
            time before dispatch.
          </p>
          <p>
            Bank transfer, JazzCash and EasyPaisa also work. Pick the method at
            checkout and we send the account details on WhatsApp once your order
            is confirmed. Card payments are not live yet.
          </p>
        </div>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Delivery</h2>
        <dl className="mt-4 space-y-3 text-[1.0625rem]">
          <div className="flex justify-between gap-6">
            <dt style={{ color: "var(--color-ink-soft)" }}>
              Karachi, Lahore, Islamabad, Rawalpindi
            </dt>
            <dd className="tnum shrink-0">{site.shipping.majorCities}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt style={{ color: "var(--color-ink-soft)" }}>Everywhere else in Pakistan</dt>
            <dd className="tnum shrink-0">{site.shipping.elsewhere}</dd>
          </div>
          <div className="rule flex justify-between gap-6 pt-3">
            <dt style={{ color: "var(--color-ink-soft)" }}>Shipping charge</dt>
            <dd className="tnum shrink-0">PKR 250</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt style={{ color: "var(--color-ink-soft)" }}>
              Orders over PKR {rupees(site.freeShippingOver)}
            </dt>
            <dd className="tnum shrink-0">Free</dd>
          </div>
        </dl>
        <p className="measure mt-4 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          We call to confirm before handing the parcel to the courier, so keep
          your phone reachable for a day after ordering.{" "}
          <Link href="/track" className="underline underline-offset-4">
            Track a placed order
          </Link>
          .
        </p>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Exchanges and returns</h2>
        <div className="measure mt-4 space-y-4 text-[1.0625rem] leading-[1.7]">
          <p>
            If the size is wrong, exchange it within seven days of delivery. The
            piece needs to be unworn and unwashed with its tag on. Message us on
            WhatsApp and we arrange the pickup.
          </p>
          <p>
            If a piece arrives with a fault or is not what you ordered, we cover
            the return shipping both ways and either replace it or refund you in
            full. Send a photo and we sort it out the same day.
          </p>
          <p style={{ color: "var(--color-ink-soft)" }}>
            Exchanges on sale pieces and bundles are size-for-size only. We
            cannot take back a piece that has been worn or washed.
          </p>
        </div>
      </section>

      <section id="sizes" className="rule mt-8 scroll-mt-24 pt-8">
        <h2 className="text-3xl">Sizes</h2>
        <p className="measure mt-3 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Body measurements in inches, not garment measurements. Everything is
          cut loose over these — Azad pieces run two sizes wider on purpose.
        </p>

        <div className="rail mt-5 -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="tnum w-full min-w-80 text-left text-sm">
            <thead>
              <tr className="rule">
                <th scope="col" className="py-2 pr-4 font-medium">Size</th>
                <th scope="col" className="py-2 pr-4 font-medium">Bust</th>
                <th scope="col" className="py-2 pr-4 font-medium">Waist</th>
                <th scope="col" className="py-2 font-medium">Hip</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((row) => (
                <tr key={row.size} className="rule">
                  <th scope="row" className="py-2.5 pr-4 font-normal">{row.size}</th>
                  <td className="py-2.5 pr-4" style={{ color: "var(--color-ink-soft)" }}>{row.bust}</td>
                  <td className="py-2.5 pr-4" style={{ color: "var(--color-ink-soft)" }}>{row.waist}</td>
                  <td className="py-2.5" style={{ color: "var(--color-ink-soft)" }}>{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="measure mt-4 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Between two sizes? Take the smaller one in Rozana and Ghar, the larger
          one in Azad.
        </p>
      </section>

      <section className="rule mt-8 pt-8">
        <h2 className="text-3xl">Still unsure</h2>
        <p className="measure mt-3">
          Send us your measurements on WhatsApp and we will tell you which size
          to take. We would rather answer first than exchange later.
        </p>
        <a
          href={whatsappLink("Salam! Can you help me pick a size?")}
          className="btn btn-sage mt-5"
        >
          Ask about sizing
        </a>
      </section>
    </div>
  );
}
