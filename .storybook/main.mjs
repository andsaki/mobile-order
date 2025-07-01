import { StorybookConfig } from "@storybook/react-vite";

const config = {
  stories: ["../app/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: ".storybook/vite.config.ts",
      },
    },
  },
  async viteFinal(config, { configType }) {
    // Remix Vite pluginを無視する設定を追加
    config.plugins = config.plugins.filter(
      (plugin) => !plugin?.name?.toLowerCase().includes("remix")
    );
    // すべてのプラグインを確認するためにログを出力
    console.log(
      "Vite plugins:",
      config.plugins.map((plugin) => plugin?.name || "Unnamed Plugin")
    );
    // Remixに関連する設定を削除
    if (config.resolve) {
      config.resolve.alias = config.resolve.alias || {};
      delete config.resolve.alias["@remix-run"];
      // すべてのRemix関連エイリアスを削除
      for (const key in config.resolve.alias) {
        if (key.toLowerCase().includes("remix")) {
          delete config.resolve.alias[key];
        }
      }
    }
    // サーバー設定を調整
    if (config.server) {
      config.server.middlewareMode = false;
      config.server.fsServe = config.server.fsServe || {};
      config.server.fsServe.root = process.cwd();
      config.server.fsServe.strict = false;
      config.server.fsServe.allow = [
        "..",
        "../app",
        "../public",
        "../node_modules",
        "./node_modules",
      ];
    }
    return config;
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;
