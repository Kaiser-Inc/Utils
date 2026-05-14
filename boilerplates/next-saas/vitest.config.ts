import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/types.ts",
        "src/**/types/**",
        // Next.js app shell — RSC layouts e pages precisam de backend real para testar
        "src/app/**",
        // shadcn/ui — gerados via CLI
        "src/components/ui/**",
        // Componentes de layout — testados via E2E (Playwright)
        "src/components/layout/sidebar.tsx",
        "src/components/layout/topbar.tsx",
        // QueryClient/SessionProvider — precisa de browser real
        "src/components/layout/providers.tsx",
        // NextAuth config — depende de BACKEND_URL e env de runtime
        "src/lib/auth/auth.ts",
        // Client hook — depende do SessionProvider
        "src/hooks/use-user.ts",
        // Zustand store — testado via integração
        "src/stores/ui-store.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
