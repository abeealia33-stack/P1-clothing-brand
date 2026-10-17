import "server-only";

// Pixel IDs are public. Keep the store's ID here so deployments work without
// extra hosting configuration; an environment variable can override it.
const configuredId = (
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1056053744116056"
).trim();

// An empty or invalid ID leaves tracking disabled and is never put into a script.
export const metaPixelId = /^\d+$/.test(configuredId) ? configuredId : null;
