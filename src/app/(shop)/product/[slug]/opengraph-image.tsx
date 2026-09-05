import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/catalogue";
import { priceLabel } from "@/lib/format";
import { getCollection } from "@/lib/types";
import { site } from "@/lib/site";

/**
 * A shared product link shows the piece, its price and what it costs to have
 * it delivered — the three things someone asks before tapping through from a
 * WhatsApp message.
 */
export const alt = "A piece from Bilques";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f0eb",
            color: "#2c2c2c",
            fontSize: 72,
          }}
        >
          {site.name}
        </div>
      ),
      size
    );
  }

  const collection = getCollection(product.collection);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f0eb",
          color: "#2c2c2c",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#6b6055" }}>
          {site.name}
          {collection ? ` · ${collection.name}` : ""}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, letterSpacing: -2, lineHeight: 1.05 }}>
            {product.name}
          </div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 20 }}>
            {priceLabel(product.price)}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* The colours it comes in, as swatches rather than a list. */}
          {product.colors.slice(0, 5).map((c) => (
            <div
              key={c.name}
              style={{
                display: "flex",
                width: 44,
                height: 44,
                borderRadius: 22,
                background: c.hex,
                border: "1px solid rgba(44,44,44,.15)",
              }}
            />
          ))}
          <div style={{ display: "flex", fontSize: 28, color: "#6b6055", marginLeft: 12 }}>
            {product.stock === 0
              ? "Sold out"
              : `Free delivery over PKR ${site.freeShippingOver.toLocaleString("en-PK")}`}
          </div>
        </div>
      </div>
    ),
    size
  );
}
