import "server-only";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/**
 * One client per process, talking to whichever database DATABASE_URL names.
 *
 * Prisma 7 connects through a driver adapter rather than a bundled engine, so
 * the adapter is chosen here: a `file:` URL is a local SQLite file for
 * development, anything else is the MySQL database on Hostinger. Nothing else
 * in the app knows or cares which one it is.
 *
 * Next's dev server re-evaluates modules on every edit; without the global the
 * process would open a fresh connection pool each time until the database
 * started refusing them.
 */
function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env — see README.md."
    );
  }

  /* SQLite is development-only, and better-sqlite3 is a native module that
     cannot be compiled on Hostinger's build machine. Loading its adapter here
     rather than at the top of the file keeps it out of production entirely,
     where DATABASE_URL is always MySQL. */
  const adapter = url.startsWith("file:")
    ? new (require("@prisma/adapter-better-sqlite3").PrismaBetterSqlite3)({ url })
    : new PrismaMariaDb(url);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
