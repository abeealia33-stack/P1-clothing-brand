"use client";

import { useId, useState } from "react";
import type { PromoBanner } from "@/lib/settings";

type Row = PromoBanner & { uploading?: boolean };

const blank: PromoBanner = {
  image: "",
  heading: "",
  subtext: "",
  buttonLabel: "Shop now",
  href: "/shop",
};

/**
 * A short list of promo banners for the home page — photo, headline, a line
 * under it, and where the button goes. Two or three read best; nothing stops
 * more, but the page starts to feel like a leaflet past that.
 */
export default function BannerEditor({
  name,
  initial,
}: {
  name: string;
  initial: PromoBanner[];
}) {
  const [rows, setRows] = useState<Row[]>(initial);
  const inputId = useId();

  const update = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const uploadImage = async (index: number, file: File) => {
    update(index, { uploading: true });
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Upload failed");
      update(index, { image: result.url, uploading: false });
    } catch {
      update(index, { uploading: false });
    }
  };

  // The uploading flag is local bookkeeping; it never goes to the server.
  const saved: PromoBanner[] = rows.map((row) => {
    const { uploading, ...banner } = row;
    void uploading;
    return banner;
  });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(saved)} />

      <div className="space-y-5">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-4 border p-4 sm:grid-cols-[10rem_1fr]"
            style={{ borderColor: "var(--color-line)" }}
          >
            <div>
              <div
                className="relative flex aspect-[4/5] items-center justify-center overflow-hidden border"
                style={{ borderColor: "var(--color-line)", background: "var(--color-khaddar)" }}
              >
                {row.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.image}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ opacity: row.uploading ? 0.45 : 1 }}
                  />
                )}
                {row.uploading && (
                  <span className="absolute text-xs">Uploading</span>
                )}
                {!row.image && !row.uploading && (
                  <span className="px-2 text-center text-xs" style={{ color: "var(--color-ink-soft)" }}>
                    No photo yet
                  </span>
                )}
              </div>
              <label htmlFor={`${inputId}-${index}`} className="btn btn-quiet mt-2 w-full cursor-pointer">
                {row.image ? "Replace" : "Choose photo"}
              </label>
              <input
                id={`${inputId}-${index}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(index, file);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium" htmlFor={`${inputId}-${index}-heading`}>
                  Headline
                </label>
                <input
                  id={`${inputId}-${index}-heading`}
                  value={row.heading}
                  onChange={(e) => update(index, { heading: e.target.value })}
                  placeholder="Spring collection, 30% off"
                  className="field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor={`${inputId}-${index}-subtext`}>
                  Line under it (optional)
                </label>
                <input
                  id={`${inputId}-${index}-subtext`}
                  value={row.subtext}
                  onChange={(e) => update(index, { subtext: e.target.value })}
                  placeholder="On everything in Rozana, this week only."
                  className="field mt-1"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium" htmlFor={`${inputId}-${index}-button`}>
                    Button text
                  </label>
                  <input
                    id={`${inputId}-${index}-button`}
                    value={row.buttonLabel}
                    onChange={(e) => update(index, { buttonLabel: e.target.value })}
                    className="field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium" htmlFor={`${inputId}-${index}-href`}>
                    Where it links to
                  </label>
                  <input
                    id={`${inputId}-${index}-href`}
                    value={row.href}
                    onChange={(e) => update(index, { href: e.target.value })}
                    placeholder="/shop?collection=rozana"
                    className="field mt-1"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                className="text-sm underline underline-offset-2"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Remove banner
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { ...blank }])}
        className="btn btn-quiet mt-4"
      >
        Add a banner
      </button>
    </div>
  );
}
