/**
 * Derives prisma/schema.dev.prisma (SQLite) from prisma/schema.prisma (MySQL).
 *
 * Hostinger gives us MySQL, which is what the live site runs on. A laptop
 * usually has no database at all, so local work runs on a SQLite file instead.
 * Rather than maintain two schemas that quietly drift apart, the dev one is
 * generated: swap the provider, drop the MySQL-only native types, and point at
 * a local file. Edit prisma/schema.prisma and nothing else.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "prisma", "schema.prisma");
const target = resolve(root, "prisma", "schema.dev.prisma");

let schema = readFileSync(source, "utf8");

schema = schema.replace(
  /datasource db \{[\s\S]*?\}/,
  `datasource db {
  provider = "sqlite"
}`
);

// SQLite has no VARCHAR/TEXT distinction, so the MySQL native types are both
// unnecessary and rejected by the SQLite connector.
schema = schema.replace(/\s+@db\.\w+(\([^)]*\))?/g, "");

schema =
  `// GENERATED FILE — do not edit.\n` +
  `// Run \`npm run db:dev-schema\` after changing prisma/schema.prisma.\n` +
  `// Source of truth: prisma/schema.prisma (MySQL, what Hostinger runs).\n\n` +
  schema.replace(/^\/\/[^\n]*\n(\/\/[^\n]*\n)*\n/, "");

writeFileSync(target, schema);
console.log("wrote prisma/schema.dev.prisma (sqlite) from prisma/schema.prisma");
