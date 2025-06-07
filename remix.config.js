/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // 静的サイト生成用の設定
  future: {
    v2_routeConvention: true,
  },
  // GitHub Pages用の静的サイト生成
  serverBuildPath: "build/index.js",
};
