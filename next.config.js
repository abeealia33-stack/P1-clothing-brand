/**
 * Plain JavaScript rather than TypeScript on purpose: Hostinger's glibc is
 * older than Next's native compiler needs, so the build falls back to the WASM
 * one, which cannot compile a TypeScript config file.
 *
 * @type {import("next").NextConfig}
 */

/**
 * Sent with every response.
 *
 * Only headers that cannot change how a page renders. A full
 * Content-Security-Policy belongs here too, but it has to name every origin
 * the site loads from — Cloudinary, Google Fonts — and getting one wrong
 * blanks images or type on the live shop, so it wants a browser to test
 * against rather than being added blind.
 */
const securityHeaders = [
  // The admin panel is a login and a set of one-click actions, which is
  // exactly what a clickjack frames. Nothing here is meant to be framed.
  { key: "X-Frame-Options", value: "DENY" },
  // An upload that claims to be a photo must not be run as a script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Order pages carry the order number in the path; do not hand it to
  // whatever a customer clicks through to next.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  /* A year of HTTPS-only for this host. Deliberately without
     includeSubDomains: webmail and anything else under bilques.com would be
     held to the same promise, and locking those out is not worth the margin. */
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig = {
  /* The SQLite adapter is an optional development dependency that is not
     installed on the server, and src/lib/prisma.ts only reaches for it when
     DATABASE_URL is a local file. Listing it here keeps the build from trying
     to resolve it into the bundle. */
  serverExternalPackages: ["@prisma/adapter-better-sqlite3"],

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
