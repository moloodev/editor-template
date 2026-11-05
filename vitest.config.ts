import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
    pool: "forks",
    restoreMocks: true,
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
