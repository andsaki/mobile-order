import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  define: {
    'process.env.MICROCMS_API_KEY': JSON.stringify('dummy_api_key'),
    'process.env.SUPABASE_URL': JSON.stringify('https://test.supabase.co'),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify('test-key'),
  },
  test: {
    globals: true,
    environment: "jsdom", // フック・ユニットテスト用にjsdom環境
    include: [
      "app/utils/**/*.test.ts",
      "app/features/**/hooks/*.test.ts",
      "app/features/**/utils/*.test.ts",
    ],
  },
});