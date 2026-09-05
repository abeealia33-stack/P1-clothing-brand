import { defineConfig } from "vitest/config";
import path from "node:path";

const src = path.resolve(import.meta.dirname, "src");

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // The database tests share one SQLite file each; running files in parallel
    // against the same copy would make their stock assertions race.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": src,
      // Not a real module outside a Next bundle.
      "server-only": path.join(src, "test", "server-only-stub.ts"),
    },
  },
});
