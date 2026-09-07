import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* The SQLite adapter is a development-only dependency that is not installed
     on the server, and src/lib/prisma.ts only reaches for it when DATABASE_URL
     is a local file. Listing it here keeps the build from trying to resolve it
     into the bundle, so a production install without it still builds. */
  serverExternalPackages: ["@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
