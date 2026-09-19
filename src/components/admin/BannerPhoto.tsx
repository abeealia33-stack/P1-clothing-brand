"use client";

import { useId, useState } from "react";

/**
 * The photograph half of a banner row: the preview, the button that replaces
 * it, and what went wrong if an upload failed.
 *
 * A failed upload used to show as "No photo yet", which looks exactly like
 * never having tried — so it says so instead.
 */
export default function BannerPhoto({
  image,
  onUploaded,
  onBusyChange,
  purpose,
  frame,
  sizeHint,
}: {
  image: string;
  onUploaded: (url: string) => void;
  /** Told when an upload starts and ends, so the form can hold its Save. */
  onBusyChange: (busy: boolean) => void;
  /** How large the stored photo may be: see IMAGE_WIDTHS in lib/uploads.ts. */
  purpose: "product" | "feature";
  /** The preview's shape, matching how the photo is cropped on the page. */
  frame: string;
  sizeHint: string;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    onBusyChange(true);
    const body = new FormData();
    body.set("file", file);
    body.set("purpose", purpose);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Upload failed.");
      onUploaded(result.url);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Upload failed.");
    } finally {
      setUploading(false);
      onBusyChange(false);
    }
  };

  return (
    <div>
      <div
        className={`relative flex items-center justify-center overflow-hidden border ${frame}`}
        style={{ borderColor: "var(--color-line)", background: "var(--color-khaddar)" }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
            style={{ opacity: uploading ? 0.45 : 1 }}
          />
        )}
        {uploading && <span className="absolute text-xs">Uploading</span>}
        {!image && !uploading && (
          <span className="px-2 text-center text-xs" style={{ color: "var(--color-ink-soft)" }}>
            No photo yet
          </span>
        )}
      </div>
      <label htmlFor={id} className="btn btn-quiet mt-2 w-full cursor-pointer">
        {image ? "Replace" : "Choose photo"}
      </label>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      <p className="mt-1.5 text-xs" style={{ color: "var(--color-ink-soft)" }}>
        {sizeHint}
      </p>
      {error && (
        <p role="alert" className="mt-1.5 text-xs" style={{ color: "var(--color-alert)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
