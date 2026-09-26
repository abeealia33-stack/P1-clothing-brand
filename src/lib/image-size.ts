/**
 * The smallest photo each upload slot accepts, in pixels. Anything smaller
 * looks soft on a large screen, so it is turned away before it is uploaded
 * rather than discovered on the live page.
 */
export type MinSize = { width: number; height: number };

export const MIN_SIZES = {
  heroDesktop: { width: 2400, height: 1350 },
  heroMobile: { width: 1080, height: 1350 },
  product: { width: 1200, height: 1600 },
  tile: { width: 1200, height: 1600 },
  pair: { width: 2000, height: 2000 },
  collectionBanner: { width: 2400, height: 600 },
  groupBanner: { width: 2400, height: 1000 },
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
