import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Where an uploaded file actually goes.
 *
 * With Cloudinary configured the file goes straight there — images resized and
 * auto-formatted, videos transcoded and served from their CDN — which is what
 * the site should run on. Without it, the file is written into public/uploads
 * so everything still works end to end on day one.
 *
 * Two routes upload: the admin panel, and a customer sending in a transfer
 * receipt. They differ in who is allowed to call them, not in how a file is
 * stored, so that part lives here.
 */

export const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
export const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/** Raised when Cloudinary is configured but will not take the file. */
export class UploadFailedError extends Error {}

/**
 * Stores the file and returns the URL to show it at.
 *
 * `folder` only reaches Cloudinary; on disk everything lands in
 * public/uploads under a random name.
 */
export async function storeUpload(
  file: File,
  kind: "image" | "video",
  folder: string
): Promise<string> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloud && key && apiSecret) {
    return toCloudinary(file, kind, folder, cloud, key, apiSecret);
  }
  return toDisk(file, kind);
}

/** Signs the parameters Cloudinary will receive; the secret never reaches the browser. */
function sign(params: Record<string, string>, apiSecret: string): string {
  const toSign =
    Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&") + apiSecret;
  return createHash("sha1").update(toSign).digest("hex");
}

async function toCloudinary(
  file: File,
  kind: "image" | "video",
  folder: string,
  cloud: string,
  key: string,
  apiSecret: string
): Promise<string> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = sign({ folder, timestamp }, apiSecret);

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", key);
  body.set("timestamp", timestamp);
  body.set("folder", folder);
  body.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/${kind}/upload`,
    { method: "POST", body }
  );
  if (!response.ok) throw new UploadFailedError(await response.text());

  const result = (await response.json()) as { secure_url?: string };
  if (!result.secure_url) throw new UploadFailedError("Cloudinary returned no URL");

  /* Ask for a sensibly sized, auto-format image rather than the original; for
     video, a capped bitrate and a web-friendly codec so a phone video does not
     ship at its original size to every visitor. */
  return kind === "image"
    ? result.secure_url.replace(
        "/image/upload/",
        "/image/upload/f_auto,q_auto,w_1200/"
      )
    : result.secure_url.replace(
        "/video/upload/",
        "/video/upload/f_auto,q_auto,vc_auto/"
      );
}

async function toDisk(file: File, kind: "image" | "video"): Promise<string> {
  const extension = EXTENSIONS[file.type] ?? (kind === "video" ? "mp4" : "jpg");
  const name = `${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, name),
    Buffer.from(await file.arrayBuffer())
  );
  return `/uploads/${name}`;
}
