import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    dir: "./tests",
    include: ["**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 30_000,
    retry: 2,
    sequence: {
      concurrent: false,
    },
  },
});
