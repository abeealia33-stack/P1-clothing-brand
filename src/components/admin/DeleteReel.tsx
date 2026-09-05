"use client";

import { useState } from "react";
import { deleteReelAction } from "@/app/admin/reels/actions";

export default function DeleteReel({ id }: { id: string }) {
  const [asking, setAsking] = useState(false);

  return (
    <section className="rule mt-12 max-w-xl pt-6">
      <h2 className="text-2xl">Remove this reel</h2>

      {!asking ? (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="mt-4 h-12 border px-4 text-sm"
          style={{ borderColor: "#9A4A3C", color: "#9A4A3C" }}
        >
          Delete this reel
        </button>
      ) : (
        <div className="mt-3 border p-4" style={{ borderColor: "#9A4A3C" }}>
          <p className="measure text-sm">
            Delete this reel for good? The video comes off the home page
            immediately and cannot be brought back.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={deleteReelAction}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="h-12 px-4 text-sm text-white"
                style={{ background: "#9A4A3C" }}
              >
                Yes, delete it
              </button>
            </form>
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="btn btn-quiet"
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
