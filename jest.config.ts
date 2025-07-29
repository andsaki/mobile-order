import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/app/setupTests.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    // eslint-disable-next-line no-useless-escape
    "^.+\.(ts|tsx)?$": "ts-jest",
  },
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/app/$1",
  },
};

export default config;