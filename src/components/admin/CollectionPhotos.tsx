"use client";

import { useState } from "react";
import BannerPhoto from "./BannerPhoto";
import { MIN_SIZES } from "@/lib/image-size";

const PLACEHOLDER = "/cloth/collection-";

/** A collection's home page tile and its shop page banner. */
export default function CollectionPhotos({
  slug,
  image,
  banner,
  onBusyChange,
}: {
  slug: string;
  image: string;
  banner: string;
  onBusyChange: (busy: boolean) => void;
}) {
  // The drawn placeholder is what shows until a photo is uploaded; it is not
  // saved back, so the field stays empty rather than pinning the placeholder.
  const [tile, setTile] = useState(image.startsWith(PLACEHOLDER) ? "" : image);
  const [wide, setWide] = useState(banner);

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
      <input type="hidden" name={`${slug}.image`} value={tile} />
      <input type="hidden" name={`${slug}.banner`} value={wide} />
      <div>
        <p className="mb-1 text-sm font-medium">Home page tile</p>
        <BannerPhoto
          image={tile || image}
          onUploaded={setTile}
          onBusyChange={onBusyChange}
          purpose="product"
          frame="aspect-[3/4]"
          sizeHint="1200 × 1600 px, 3:4 portrait, under 200 KB."
          minSize={MIN_SIZES.tile}
        />
      </div>
      <div>
        <p className="mb-1 text-sm font-medium">Shop page banner (optional)</p>
        <BannerPhoto
          image={wide}
          onUploaded={setWide}
          onBusyChange={onBusyChange}
          purpose="feature"
          frame="aspect-[4/1]"
          sizeHint="2400 × 600 px, a slim strip across the top of this collection."
          minSize={MIN_SIZES.collectionBanner}
        />
        {wide && (
          <button
            type="button"
            onClick={() => setWide("")}
            className="mt-1 text-xs underline underline-offset-4"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Remove banner
          </button>
        )}
      </div>
    </div>
  );
}
