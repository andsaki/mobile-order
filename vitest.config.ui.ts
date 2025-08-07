import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom", // UIテストなのでjsdom環境
    setupFiles: "./app/setupTests.ts",
    include: ["app/components/**/*.test.tsx", "app/features/**/*.test.tsx"], // app/componentsとapp/features配下のテストファイルのみを対象
  },
});