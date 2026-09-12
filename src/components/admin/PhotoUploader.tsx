"use client";

import { useId, useRef, useState } from "react";

type Photo = { url: string; uploading?: boolean; error?: string };

/**
 * Drag photos in, drag them around to reorder, click to remove.
 *
 * Everything works by keyboard too — each photo has Move left / Move right /
 * Remove buttons — because dragging is impossible for some people and fiddly
 * for everyone on a phone. The first photo is the one the shop leads with, and
 * the panel says so rather than expecting anyone to guess.
 */
export default function PhotoUploader({
  name,
  initial,
  purpose = "product",
}: {
  name: string;
  initial: string[];
  /** "feature" for the pictures that run the full width of the page. */
  purpose?: "product" | "feature";
}) {
  const [photos, setPhotos] = useState<Photo[]>(
    initial.map((url) => ({ url }))
  );
  const [over, setOver] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    // Show each photo immediately with a local preview, then swap in the
    // stored URL as each upload lands.
    const pending: Photo[] = list.map((file) => ({
      url: URL.createObjectURL(file),
      uploading: true,
    }));
    setPhotos((prev) => [...prev, ...pending]);

    await Promise.all(
      list.map(async (file, i) => {
        const preview = pending[i].url;
        const body = new FormData();
        body.set("file", file);
        body.set("purpose", purpose);
        try {
          const response = await fetch("/api/admin/upload", {
            method: "POST",
            body,
          });
          const result = (await response.json()) as {
            url?: string;
            error?: string;
          };
          if (!response.ok || !result.url) {
            throw new Error(result.error ?? "Upload failed");
          }
          setPhotos((prev) =>
            prev.map((p) =>
              p.url === preview ? { url: result.url as string } : p
            )
          );
          URL.revokeObjectURL(preview);
        } catch (error) {
          setPhotos((prev) =>
            prev.map((p) =>
              p.url === preview
                ? {
                    ...p,
                    uploading: false,
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : p
            )
          );
        }
      })
    );
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    setPhotos((prev) => {
      const next = [...prev];
      const [taken] = next.splice(from, 1);
      next.splice(to, 0, taken);
      return next;
    });
  };

  const remove = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const saved = photos.filter((p) => !p.uploading && !p.error).map((p) => p.url);

  return (
    <div>
      {/* The value the form actually submits, kept in step with the list. */}
      <input type="hidden" name={name} value={JSON.stringify(saved)} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center border-2 border-dashed px-4 py-8 text-center transition-colors"
        style={{
          borderColor: over ? "var(--color-sage-deep)" : "var(--color-line)",
          background: over ? "var(--color-khaddar)" : "transparent",
        }}
      >
        <p className="text-sm">Drag photos here</p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          or
        </p>
        <label htmlFor={inputId} className="btn btn-quiet mt-2 cursor-pointer">
          Choose photos
        </label>
        <input
          id={inputId}
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) void upload(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="mt-3 text-xs" style={{ color: "var(--color-ink-soft)" }}>
          JPG, PNG or WebP, up to 8 MB each
        </p>
      </div>

      {photos.length > 0 && (
        <>
          <p className="mt-4 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            The first photo is the one shoppers see first. Drag to reorder.
          </p>

          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <li
                key={`${photo.url}-${index}`}
                draggable={!photo.uploading}
                onDragStart={() => setDragFrom(index)}
                onDragEnd={() => setDragFrom(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragFrom !== null) move(dragFrom, index);
                  setDragFrom(null);
                }}
                className="relative"
                style={{ opacity: dragFrom === index ? 0.4 : 1 }}
              >
                <div
                  className="relative aspect-[3/4] overflow-hidden border"
                  style={{
                    borderColor:
                      index === 0 ? "var(--color-sage-deep)" : "var(--color-line)",
                    background: "var(--color-khaddar)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ opacity: photo.uploading ? 0.45 : 1 }}
                  />
                  {index === 0 && !photo.uploading && !photo.error && (
                    <span
                      className="absolute top-1 left-1 px-1.5 py-0.5 text-[0.625rem] text-white"
                      style={{ background: "var(--color-sage-deep)" }}
                    >
                      Main
                    </span>
                  )}
                  {photo.uploading && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs">
                      Uploading
                    </span>
                  )}
                </div>

                {photo.error ? (
                  <p className="mt-1 text-xs" style={{ color: "var(--color-alert)" }}>
                    {photo.error}
                  </p>
                ) : (
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0}
                        aria-label={`Move photo ${index + 1} earlier`}
                        className="h-8 w-8 text-sm disabled:opacity-30"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, index + 1)}
                        disabled={index === photos.length - 1}
                        aria-label={`Move photo ${index + 1} later`}
                        className="h-8 w-8 text-sm disabled:opacity-30"
                      >
                        ›
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove photo ${index + 1}`}
                      className="h-8 px-1 text-xs underline underline-offset-2"
                      style={{ color: "var(--color-ink-soft)" }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
