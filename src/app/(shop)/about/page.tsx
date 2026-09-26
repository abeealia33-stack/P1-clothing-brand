import type { Metadata } from "next";
import Link from "next/link";
import ClothImage from "@/components/ClothImage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bilques makes everyday cotton and khaddar clothing in small runs, sold from Lahore with cash on delivery across Pakistan.",
};

const WONT = [
  "Run a permanent sale. The price on the piece is the price.",
  "Photograph a fit we have not checked on a real body first.",
  "Take your money before you have the clothes in your hands — cash on delivery is the default, and always will be.",
];

export default function AboutPage() {
  return (
    <div className="pb-10 md:pb-16">
      {/* The mill first, full width: the story starts with the cloth. */}
      <figure>
        <div className="aspect-[4/5] overflow-hidden sm:aspect-[3/2] md:max-h-[70vh] md:w-full">
          <ClothImage
            src="/cloth/suti-kurta-2.svg"
            alt="Close view of the cotton weave used across the Rozana collection"
            priority
          />
        </div>
        <figcaption className="mx-auto max-w-7xl px-5 md:px-16 pt-3 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          The cotton we use across Rozana, photographed at the mill in Faisalabad before it was cut.
        </figcaption>
      </figure>

      <div className="mx-auto max-w-7xl px-5 md:px-16 pt-10 md:pt-16">
        <p className="urdu text-2xl" style={{ color: "var(--color-sage-deep)" }}>
          آرام سے تیار
        </p>
        <p className="text-sm tracking-[0.12em] uppercase" style={{ color: "var(--color-sage-deep)" }}>
          {site.tagline}
        </p>
        <h1 className="mt-3 text-[2.25rem] md:text-[3.5rem]">Dressed, and comfortable about it</h1>

        <div className="measure mt-7 space-y-5 text-[1.0625rem] leading-[1.75]">
          <p>
            Bilques started with a complaint. Everything soft enough to live in
            looked like nightwear, and everything that looked put-together had
            to be ironed, adjusted, and endured. There was nothing in between,
            which is where most of a week actually happens.
          </p>
          <p>
            So we make the in-between. Cotton, lawn and khaddar, cut loose,
            stitched properly, in colours that do not shout. A kurta you can
            wear to a lecture and then to your mother’s house. A home set
            decent enough to answer the door in.
          </p>
          <p>
            Everything is made in small runs in Lahore. Small runs mean we can
            fix what is not working — a sleeve that pulls, a length that sits
            wrong — instead of committing a thousand pieces to a mistake. It
            also means things sell out, and we would rather that than a
            warehouse of clothes nobody wanted.
          </p>
          <p>
            Prices sit between PKR 1,800 and 3,500 on purpose. Owning three
            kurtas you like is better than owning one you are careful with.
          </p>
        </div>
      </div>

      {/* The most persuasive thing on the site, given room to be read. */}
      <section id="promises" className="home-section mx-auto max-w-7xl scroll-mt-20 px-5 md:px-16">
        <h2 className="home-h2">What we will not do</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3 md:gap-6">
          {WONT.map((line, i) => (
            <li key={line} className="p-6 md:p-8" style={{ background: "var(--color-khaddar)" }}>
              <span className="tnum text-sm" style={{ color: "var(--color-sage-deep)" }}>
                0{i + 1}
              </span>
              <p className="mt-3 text-xl leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                {line}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link href="/shop" className="btn btn-ink">
            See the pieces
          </Link>
          <Link href="/contact" className="text-sm underline underline-offset-4">
            Talk to us
          </Link>
        </div>
      </section>
    </div>
  );
}
