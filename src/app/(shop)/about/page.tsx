import type { Metadata } from "next";
import Link from "next/link";
import ClothImage from "@/components/ClothImage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bilques makes everyday cotton and khaddar clothing in small runs, sold from Lahore with cash on delivery across Pakistan.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-16">
      <div className="md:grid md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <p className="urdu text-2xl" style={{ color: "var(--color-sage-deep)" }}>
            آرام سے تیار
          </p>
          <h1 className="mt-1 text-5xl md:text-6xl">
            Dressed, and comfortable about it
          </h1>

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

          <div className="rule mt-9 pt-7">
            <h2 className="text-3xl">What we will not do</h2>
            <ul className="measure mt-4 space-y-3 text-sm">
              {[
                "Run a permanent sale. The price on the piece is the price.",
                "Photograph a fit we have not checked on a real body first.",
                "Take your money before you have the clothes in your hands — cash on delivery is the default, and always will be.",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-px w-3 shrink-0"
                    style={{ background: "var(--color-sage)" }}
                  />
                  <span style={{ color: "var(--color-ink-soft)" }}>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-ink">
              See the pieces
            </Link>
            <Link href="/contact" className="btn btn-quiet">
              Talk to us
            </Link>
          </div>
        </div>

        <div className="mt-12 md:col-span-5 md:mt-0">
          <div className="aspect-[3/4] overflow-hidden">
            <ClothImage
              src="/cloth/suti-kurta-2.svg"
              alt="Close view of the cotton weave used across the Rozana collection"
            />
          </div>
          <p className="mt-3 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            The cotton we use across Rozana, photographed at the mill in
            Faisalabad before it was cut.
          </p>
        </div>
      </div>
    </div>
  );
}
