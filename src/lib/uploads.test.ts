import { describe, expect, it } from "vitest";
import { deliveryUrl, IMAGE_WIDTHS, isImagePurpose } from "./uploads";

/**
 * What the shop links to after an upload. The transform is the difference
 * between a phone on mobile data waiting for a 4 MB photograph and getting a
 * couple of hundred kilobytes that look the same.
 */

const uploaded = (kind: "image" | "video") =>
  `https://res.cloudinary.com/demo/${kind}/upload/v1234567890/bilques/piece.jpg`;

describe("deliveryUrl", () => {
  it("asks for a modern format and automatic quality", () => {
    const url = deliveryUrl(uploaded("image"), "image");
    expect(url).toContain("f_auto");
    expect(url).toContain("q_auto");
  });

  it("only ever shrinks a photo, so a small one is not blown up", () => {
    expect(deliveryUrl(uploaded("image"), "image")).toContain("c_limit");
  });

  it("keeps a feature picture wide enough for a desktop window", () => {
    expect(deliveryUrl(uploaded("image"), "image", "feature")).toContain(
      `w_${IMAGE_WIDTHS.feature}`
    );
  });

  it("holds a product photo to the width it is actually shown at", () => {
    expect(deliveryUrl(uploaded("image"), "image", "product")).toContain(
      `w_${IMAGE_WIDTHS.product}`
    );
  });

  it("treats a photo as a product photo unless told otherwise", () => {
    expect(deliveryUrl(uploaded("image"), "image")).toBe(
      deliveryUrl(uploaded("image"), "image", "product")
    );
  });

  it("transcodes a video rather than resizing it", () => {
    const url = deliveryUrl(uploaded("video"), "video");
    expect(url).toContain("vc_auto");
    expect(url).not.toContain("w_");
  });

  it("leaves the rest of the address alone", () => {
    expect(deliveryUrl(uploaded("image"), "image")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_1200/v1234567890/bilques/piece.jpg"
    );
  });
});

describe("isImagePurpose", () => {
  it("accepts the two the shop uses", () => {
    expect(isImagePurpose("product")).toBe(true);
    expect(isImagePurpose("feature")).toBe(true);
  });

  it("rejects anything else, so a stray value cannot ask for a huge file", () => {
    expect(isImagePurpose("")).toBe(false);
    expect(isImagePurpose("original")).toBe(false);
  });
});
