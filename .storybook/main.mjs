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
  async viteFinal(config) {
    // Remix Vite pluginを除外
    config.plugins = config.plugins.filter(
      (plugin) => !plugin?.name?.toLowerCase().includes("remix")
    );

    // Remix関連のエイリアスを削除
    if (config.resolve) {
      config.resolve.alias = config.resolve.alias || {};
      delete config.resolve.alias["@remix-run"];
      for (const key in config.resolve.alias) {
        if (key.toLowerCase().includes("remix")) {
          delete config.resolve.alias[key];
        }
      }
    }

    // サーバー設定の調整
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
