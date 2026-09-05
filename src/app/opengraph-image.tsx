import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/**
 * The picture that appears when a Bilques link is pasted into WhatsApp or
 * Instagram. Drawn rather than shipped as a file: the catalogue photography
 * is still SVG placeholder art, which unfurlers refuse to render.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#f5f0eb",
          color: "#2c2c2c",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#5c6b58" }}>
          {site.tagline}
        </div>
        <div style={{ display: "flex", fontSize: 132, letterSpacing: -3, marginTop: 8 }}>
          {site.name}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#6b6055", marginTop: 24 }}>
          Cotton and khaddar, cut loose. Cash on delivery across Pakistan.
        </div>
        <div style={{ display: "flex", height: 8, background: "#8b9e8b", marginTop: 48 }} />
      </div>
    ),
    size
  );
}
