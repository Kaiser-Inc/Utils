import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/main.ts",
        "src/app/core/telemetry.ts",
        "src/app/core/database.ts",
        "src/app/repositories/drizzle/**",
      ],
    },
  },
});
