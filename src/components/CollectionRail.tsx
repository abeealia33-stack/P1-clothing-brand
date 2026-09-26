import Link from "next/link";
import ClothImage from "./ClothImage";
import type { ResolvedCollection } from "@/lib/types";

/**
 * The collections as one row of 3:4 tiles — the same ratio as every product
 * photo, so the home page grids line up. Two across and swipeable on a
 * phone (a sliver of the next tile says there is more), four abreast on a
 * desktop. The whole tile is the link; the names sit on the photo.
 */
export default function CollectionRail({
  collections,
}: {
  collections: ResolvedCollection[];
}) {
  return (
    <div className="rail -mx-5 gap-3 px-5 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
      {collections.map((c) => (
        <Link
          key={c.slug}
          href={`/shop?collection=${c.slug}`}
          className="group relative block aspect-[3/4] w-[44vw] overflow-hidden md:w-auto"
        >
          <ClothImage
            src={c.image}
            alt=""
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background: "linear-gradient(to top, rgba(28,26,23,.5) 0%, rgba(28,26,23,0) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 md:p-5">
            <h3 className="text-2xl text-white md:text-3xl">{c.name}</h3>
            <p className="urdu shrink-0 pb-0 text-lg leading-none text-white/90" style={{ textAlign: "right" }}>
              {c.urdu}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
