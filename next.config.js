/**
 * Plain JavaScript rather than TypeScript on purpose: Hostinger's glibc is
 * older than Next's native compiler needs, so the build falls back to the WASM
 * one, which cannot compile a TypeScript config file.
 *
 * @type {import("next").NextConfig}
 */
const nextConfig = {
  /* The SQLite adapter is an optional development dependency that is not
     installed on the server, and src/lib/prisma.ts only reaches for it when
     DATABASE_URL is a local file. Listing it here keeps the build from trying
     to resolve it into the bundle. */
  serverExternalPackages: ["@prisma/adapter-better-sqlite3"],
};

module.exports = nextConfig;
