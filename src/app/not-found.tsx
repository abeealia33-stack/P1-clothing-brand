import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <h1 className="text-[2.25rem] md:text-[3.5rem]">This page is not here</h1>
      <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
        The piece may have sold out and been taken down, or the link may be
        mistyped. The shop is still where you left it.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/shop" className="btn btn-ink">
          Go to the shop
        </Link>
        <Link href="/" className="btn btn-quiet">
          Back home
        </Link>
      </div>
    </div>
  );
}
