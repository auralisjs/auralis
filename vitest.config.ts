import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      all: true,
      provider: "v8",
      reporter: ["clover", "cobertura", "json-summary", "json", "lcov", "text"],
      exclude: ["**/dist/**", "**/*.config.ts", "docs/.vitepress/**"],
      reportOnFailure: true,
      // thresholds: {
      //   lines: 90,
      //   statements: 90,
      //   functions: 90,
      //   branches: 85,
      // },
    },
    reporters: process.env.CI
      ? ["default", "github-actions"]
      : [["default", { summary: false }]],
  },
});
