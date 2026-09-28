import Link from "next/link";
import ClothImage from "./ClothImage";

/**
 * A wide band for a sale or a drop: ink, with the words on the left and the
 * way in on the right. A photograph sits behind them when there is one,
 * darkened enough that the type stays readable over any of it.
 */
export default function SaleBand({
  image,
  eyebrow,
  heading,
  buttonLabel,
  href,
}: {
  image: string;
  eyebrow: string;
  heading: string;
  buttonLabel: string;
  href: string;
}) {
  return (
    <section className="home-section">
      <div className="mx-auto max-w-7xl px-5 md:px-16">
        <div className="sale-band relative isolate overflow-hidden">
          {image && (
            <>
              <div className="absolute inset-0 -z-10">
                <ClothImage src={image} alt="" />
              </div>
              <div className="sale-band-scrim absolute inset-0 -z-10" />
            </>
          )}

          <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:gap-10 md:p-12">
            <div>
              {eyebrow && <p className="sale-band-eyebrow">{eyebrow}</p>}
              {heading && <p className="sale-band-heading">{heading}</p>}
            </div>
            <Link href={href} className="sale-band-btn shrink-0">
              {buttonLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
