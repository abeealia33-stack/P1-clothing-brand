/**
 * Every product image on the site goes through here.
 *
 * Today it renders the drawn SVG placeholders from /public/cloth with a plain
 * <img>, because Next's image optimizer refuses SVG unless SVG handling is
 * force-enabled — not a trade worth making for placeholder art. When the
 * owner's real photographs are uploaded to Cloudinary, this is the one file
 * that changes: swap in next/image and point at the Cloudinary loader.
 */
type Props = {
  src: string;
  alt: string;
  className?: string;
  /** The hero and the first product image should not wait for lazy loading. */
  priority?: boolean;
  sizes?: string;
};

export default function ClothImage({
  src,
  alt,
  className = "",
  priority = false,
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={400}
      height={533}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={`block h-full w-full object-cover ${className}`}
      style={{ backgroundColor: "var(--color-khaddar)" }}
    />
  );
}
