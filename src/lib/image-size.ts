/**
 * The smallest photo each slot will take, in pixels.
 *
 * A floor, not a specification. The size printed under each upload box is
 * what to aim for; this is only the point below which a picture is going to
 * look soft however it is used, and it sits well under the recommendation so
 * that a photograph a little off the ideal still goes up. A guardrail that
 * turns away usable work is working against the person it is meant to help.
 *
 * Nothing here asks for more than the picture is ever served at either:
 * IMAGE_WIDTHS in uploads.ts caps a feature photo at 2000px wide and a
 * product photo at 1200, and the rest is discarded on the way in.
 */
export type MinSize = { width: number; height: number };

export const MIN_SIZES = {
  heroDesktop: { width: 1600, height: 700 },
  heroMobile: { width: 900, height: 1125 },
  product: { width: 1000, height: 1333 },
  tile: { width: 1000, height: 1333 },
  pair: { width: 1400, height: 1400 },
  collectionBanner: { width: 1600, height: 400 },
  groupBanner: { width: 1600, height: 660 },
} satisfies Record<string, MinSize>;

export const sizeLabel = ({ width, height }: MinSize) => `${width} × ${height} px`;

/** Why a photo is too small for its slot, or null when it is big enough. */
export function tooSmall(actual: MinSize, min: MinSize): string | null {
  if (actual.width >= min.width && actual.height >= min.height) return null;
  return `This photo is ${actual.width} × ${actual.height} px. It needs to be at least ${sizeLabel(min)}.`;
}

/** Reads a chosen file's pixel size in the browser, without uploading it. */
export async function readImageSize(file: File): Promise<MinSize | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    // A format the browser cannot decode: let the server decide.
    return null;
  }
}

export async function checkImageSize(file: File, min: MinSize): Promise<string | null> {
  const size = await readImageSize(file);
  return size ? tooSmall(size, min) : null;
}
