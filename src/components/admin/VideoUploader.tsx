"use client";

import { useId, useRef, useState } from "react";

type State =
  | { status: "empty" }
  | { status: "uploading"; preview: string }
  | { status: "ready"; url: string; preview: string }
  | { status: "error"; message: string; preview: string };

/**
 * Drag a single video in, or pick one. Same drop-zone language as
 * PhotoUploader so the two forms feel like one system, but a reel is one
 * video, not a reorderable set.
 */
export default function VideoUploader({
  name,
  initial,
}: {
  name: string;
  initial: string | null;
}) {
  const [state, setState] = useState<State>(
    initial ? { status: "ready", url: initial, preview: initial } : { status: "empty" }
  );
  const [over, setOver] = useState(false);
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("video/")) return;

    const preview = URL.createObjectURL(file);
    setState({ status: "uploading", preview });

    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "Upload failed");
      }
      setState({ status: "ready", url: result.url, preview });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Upload failed",
        preview,
      });
    }
  };

  const value = state.status === "ready" ? state.url : "";

  return (
    <div>
      <input type="hidden" name={name} value={value} />

      {state.status === "empty" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void upload(e.dataTransfer.files[0]);
          }}
          className="flex flex-col items-center justify-center border-2 border-dashed px-4 py-8 text-center transition-colors"
          style={{
            borderColor: over ? "var(--color-sage-deep)" : "var(--color-line)",
            background: over ? "var(--color-khaddar)" : "transparent",
          }}
        >
          <p className="text-sm">Drag a video here</p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-ink-soft)" }}>
            or
          </p>
          <label htmlFor={inputId} className="btn btn-quiet mt-2 cursor-pointer">
            Choose a video
          </label>
          <input
            id={inputId}
            ref={fileInput}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="sr-only"
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <p className="mt-3 text-xs" style={{ color: "var(--color-ink-soft)" }}>
            MP4 or MOV, up to 40 MB — filmed upright works best
          </p>
        </div>
      )}

      {state.status !== "empty" && (
        <div className="flex items-start gap-4">
          <div
            className="relative aspect-[9/16] w-32 shrink-0 overflow-hidden border"
            style={{ borderColor: "var(--color-line)", background: "var(--color-khaddar)" }}
          >
            <video
              src={state.preview}
              muted
              playsInline
              loop
              autoPlay
              className="h-full w-full object-cover"
              style={{ opacity: state.status === "uploading" ? 0.45 : 1 }}
            />
            {state.status === "uploading" && (
              <span className="absolute inset-0 flex items-center justify-center text-xs">
                Uploading
              </span>
            )}
          </div>

          <div>
            {state.status === "error" && (
              <p className="text-sm" style={{ color: "#9A4A3C" }}>
                {state.message}
              </p>
            )}
            {state.status === "ready" && (
              <p className="text-sm" style={{ color: "var(--color-sage-deep)" }}>
                Video attached.
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                fileInput.current?.click();
              }}
              className="mt-2 text-sm underline underline-offset-2"
              style={{ color: "var(--color-ink-soft)" }}
            >
              Replace video
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="sr-only"
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
