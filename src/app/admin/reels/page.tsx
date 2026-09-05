import type { Metadata } from "next";
import Link from "next/link";
import { toggleReelAction, moveReelAction } from "./actions";
import { requireAdmin } from "@/lib/auth";
import { listReels } from "@/lib/reels";

export const metadata: Metadata = { title: "Reels" };
export const dynamic = "force-dynamic";

export default async function AdminReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireAdmin();

  const { saved, deleted } = await searchParams;
  const reels = await listReels({ includeInactive: true });

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">Reels</h1>
        <Link href="/admin/reels/new" className="btn btn-ink">
          Add a reel
        </Link>
      </div>

      <p className="measure mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        Short videos that scroll across the home page. Tapping one opens the
        piece it is linked to.
      </p>

      {(saved || deleted) && (
        <p
          role="status"
          className="mt-4 border-l-2 py-2 pl-3 text-sm"
          style={{ borderColor: "var(--color-sage)" }}
        >
          {saved ? "Saved. The reel is showing on the home page." : "Deleted."}
        </p>
      )}

      {reels.length === 0 ? (
        <div
          className="mt-10 border p-8 text-center"
          style={{ borderColor: "var(--color-line)" }}
        >
          <h2 className="text-2xl">No reels yet</h2>
          <p
            className="measure mx-auto mt-2 text-sm"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Add a short video of a piece and it appears in a scrolling strip on
            the home page.
          </p>
          <Link href="/admin/reels/new" className="btn btn-ink mt-5">
            Add a reel
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {reels.map((reel, index) => (
            <li key={reel.id}>
              <Link
                href={`/admin/reels/${reel.id}`}
                className="relative block aspect-[9/16] overflow-hidden border"
                style={{
                  borderColor: "var(--color-line)",
                  background: "var(--color-khaddar)",
                }}
              >
                <video
                  src={reel.video}
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                {!reel.active && (
                  <span
                    className="absolute top-1 left-1 px-1.5 py-0.5 text-[0.6875rem]"
                    style={{ background: "var(--color-khaddar)", color: "var(--color-ink-soft)" }}
                  >
                    Hidden
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 truncate p-2 text-xs text-white" style={{ background: "linear-gradient(to top, rgba(0,0,0,.6), transparent)" }}>
                  {reel.productName}
                </span>
              </Link>

              <div className="mt-2 flex items-center justify-between gap-1">
                <div className="flex">
                  <form action={moveReelAction}>
                    <input type="hidden" name="id" value={reel.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label="Move earlier"
                      className="h-8 w-8 text-sm disabled:opacity-30"
                    >
                      ‹
                    </button>
                  </form>
                  <form action={moveReelAction}>
                    <input type="hidden" name="id" value={reel.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === reels.length - 1}
                      aria-label="Move later"
                      className="h-8 w-8 text-sm disabled:opacity-30"
                    >
                      ›
                    </button>
                  </form>
                </div>
                <form action={toggleReelAction}>
                  <input type="hidden" name="id" value={reel.id} />
                  <button
                    type="submit"
                    className="h-8 px-2 text-xs"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    {reel.active ? "Hide" : "Show"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
