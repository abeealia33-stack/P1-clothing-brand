import { NextResponse } from "next/server";
import { isSignedIn } from "@/lib/auth";
import {
  IMAGE_TYPES,
  isImagePurpose,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  storeUpload,
  UploadFailedError,
  VIDEO_TYPES,
} from "@/lib/uploads";

/**
 * Receives a dropped photo or video from the admin panel and returns the URL
 * to show it at. Where the file ends up is decided in lib/uploads.ts.
 */
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

  try {
    /* Says how big the picture is allowed to be kept: a hero runs the width of
       a desktop window, a product photo never does. An unrecognised value
       falls back to the smaller of the two rather than the larger. */
    const asked = String(form.get("purpose") ?? "");
    const purpose = isImagePurpose(asked) ? asked : "product";

    const url = await storeUpload(
      file,
      isVideo ? "video" : "image",
      isVideo ? "bilques/reels" : "bilques",
      purpose
    );
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UploadFailedError) {
      console.error("Cloudinary upload failed", error);
      return NextResponse.json(
        { error: "Cloudinary would not accept that file. Check your keys." },
        { status: 502 }
      );
    }
    throw error;
  }
}
