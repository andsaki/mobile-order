import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  define: { 'process.env.MICROCMS_API_KEY': JSON.stringify('dummy_api_key') },
  test: {
    globals: true,
    environment: "node", // 単体テストなのでnode環境
    include: ["app/utils/**/*.test.ts"], // app/utils配下のテストファイルのみを対象
  },
});