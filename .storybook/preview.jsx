import React from "react";
import { BrowserRouter } from "react-router-dom";
import "../app/tailwind.css";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: "dark",
    values: [
      { name: "light", value: "#ffffff" },
      { name: "dark", value: "#333333" },
    ],
  },
};

export const decorators = [
  (Story) => (
    <BrowserRouter>
      <Story />
    </BrowserRouter>
  ),
];
