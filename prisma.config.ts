import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 reads the connection URL from here rather than from the schema.
 *
 * It also picks which schema to use. A `file:` URL means someone is working on
 * their own machine with no database installed, so the generated SQLite schema
 * applies; anything else is the real MySQL one that runs on Hostinger. The
 * models are identical either way — see scripts/make-dev-schema.mjs.
 */
const url = process.env.DATABASE_URL ?? "";
const isLocalFile = url.startsWith("file:");

export default defineConfig({
  schema: isLocalFile ? "prisma/schema.dev.prisma" : "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
