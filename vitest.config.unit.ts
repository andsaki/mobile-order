import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node", // 単体テストなのでnode環境
    include: ["app/utils/**/*.test.ts"], // app/utils配下のテストファイルのみを対象
  },
});