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

/**
 * How wide a stored image is allowed to be, by what it is for.
 *
 * A product photo is never shown wider than about 530 points, so 1200 covers
 * it twice over on a retina screen and no further pixel is ever seen. The
 * hero and the promo banners run the full width of a desktop window, which is
 * why they are allowed nearly twice that.
 */
export const IMAGE_WIDTHS = { product: 1200, feature: 2000 } as const;

export type ImagePurpose = keyof typeof IMAGE_WIDTHS;

export const isImagePurpose = (value: string): value is ImagePurpose =>
  value === "product" || value === "feature";

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
  folder: string,
  purpose: ImagePurpose = "product"
): Promise<string> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloud && key && apiSecret) {
    return toCloudinary(file, kind, folder, purpose, cloud, key, apiSecret);
  }
  return toDisk(file, kind);
}

/**
 * What Cloudinary should hand to a browser, rather than the original upload.
 *
 * `f_auto` sends WebP or AVIF to anything that takes them, `q_auto` finds the
 * point where more bytes stop being visible, and `c_limit` only ever shrinks:
 * a width on its own would scale a small photo *up*, making a heavier file out
 * of detail that was never in the picture.
 *
 * Kept apart from the upload itself so the rewriting can be tested without a
 * network call.
 */
export function deliveryUrl(
  secureUrl: string,
  kind: "image" | "video",
  purpose: ImagePurpose = "product"
): string {
  if (kind === "video") {
    return secureUrl.replace("/video/upload/", "/video/upload/f_auto,q_auto,vc_auto/");
  }
  const width = IMAGE_WIDTHS[purpose];
  return secureUrl.replace(
    "/image/upload/",
    `/image/upload/f_auto,q_auto,c_limit,w_${width}/`
  );
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
  purpose: ImagePurpose,
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

  // The original stays on Cloudinary; what the shop links to is the version
  // sized and compressed for a browser.
  return deliveryUrl(result.secure_url, kind, purpose);
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
