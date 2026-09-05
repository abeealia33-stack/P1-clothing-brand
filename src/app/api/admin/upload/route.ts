import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isSignedIn } from "@/lib/auth";

/**
 * Receives a dropped photo or video and returns the URL to show it at.
 *
 * With Cloudinary configured the file goes straight there — images resized
 * and auto-formatted, videos transcoded and served from their CDN — which is
 * what the site should run on. Without it, the file is written into
 * public/uploads so the panel still works end to end on day one.
 */

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

export async function POST(request: Request) {
  // This route is not a page, so the proxy's redirect does not apply to it.
  if (!(await isSignedIn())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "That upload was not readable." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was attached." }, { status: 400 });
  }

  const isVideo = VIDEO_TYPES.has(file.type);
  const isImage = IMAGE_TYPES.has(file.type);

  if (!isVideo && !isImage) {
    return NextResponse.json(
      { error: "Use a JPG, PNG or WebP photo, or an MP4 or MOV video." },
      { status: 415 }
    );
  }

  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return NextResponse.json(
      {
        error: isVideo
          ? "That video is over 40 MB. Trim it or export at a lower quality."
          : "That photo is over 8 MB. Try a smaller one.",
      },
      { status: 413 }
    );
  }

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloud && key && apiSecret) {
    try {
      const url = isVideo
        ? await toCloudinaryVideo(file, cloud, key, apiSecret)
        : await toCloudinaryImage(file, cloud, key, apiSecret);
      return NextResponse.json({ url });
    } catch (error) {
      console.error("Cloudinary upload failed", error);
      return NextResponse.json(
        { error: "Cloudinary would not accept that file. Check your keys." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ url: await toDisk(file, isVideo) });
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

async function toCloudinaryImage(
  file: File,
  cloud: string,
  key: string,
  apiSecret: string
): Promise<string> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = "bilques";
  const signature = sign({ folder, timestamp }, apiSecret);

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", key);
  body.set("timestamp", timestamp);
  body.set("folder", folder);
  body.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    { method: "POST", body }
  );
  if (!response.ok) throw new Error(await response.text());

  const result = (await response.json()) as { secure_url?: string };
  if (!result.secure_url) throw new Error("Cloudinary returned no URL");

  // Ask for a sensibly sized, auto-format image rather than the original.
  return result.secure_url.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto,w_1200/"
  );
}

async function toCloudinaryVideo(
  file: File,
  cloud: string,
  key: string,
  apiSecret: string
): Promise<string> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = "bilques/reels";
  const signature = sign({ folder, timestamp }, apiSecret);

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", key);
  body.set("timestamp", timestamp);
  body.set("folder", folder);
  body.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/video/upload`,
    { method: "POST", body }
  );
  if (!response.ok) throw new Error(await response.text());

  const result = (await response.json()) as { secure_url?: string };
  if (!result.secure_url) throw new Error("Cloudinary returned no URL");

  // Capped bitrate and a web-friendly codec so a phone video does not ship
  // at its original size to every visitor.
  return result.secure_url.replace(
    "/video/upload/",
    "/video/upload/f_auto,q_auto,vc_auto/"
  );
}

async function toDisk(file: File, isVideo: boolean): Promise<string> {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  const extension = extensions[file.type] ?? (isVideo ? "mp4" : "jpg");
  const name = `${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, name),
    Buffer.from(await file.arrayBuffer())
  );
  return `/uploads/${name}`;
}
