import Link from "next/link";
import ClothImage from "./ClothImage";
import type { ResolvedCollection } from "@/lib/types";

/**
 * The ranges as cards: the photograph above, the name and its line below on
 * paper, an arrow at the edge. Three abreast on a desktop, a swipeable row
 * on a phone.
 *
 * Made to measure and group orders are deliberately not here — they are ways
 * of buying, not ranges to browse, and they have their own places on the page.
 */
export default function CollectionRail({
  collections,
}: {
  collections: ResolvedCollection[];
}) {
  return (
    <div className="rail -mx-5 gap-4 px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
      {collections.map((c) => (
        <Link key={c.slug} href={`/shop?collection=${c.slug}`} className="cat-card group">
          <div className="cat-card-photo">
            <ClothImage
              src={c.image}
              alt=""
              className="transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="cat-card-foot">
            <div className="min-w-0">
              <h3 className="cat-card-name">
                {c.name}{" "}
                <span className="urdu pb-0 text-base leading-none">{c.urdu}</span>
              </h3>
              <p className="cat-card-line">{c.line}</p>
            </div>
            <svg
              className="cat-card-arrow"
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
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
