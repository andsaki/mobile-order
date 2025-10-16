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
    default: "light",
    values: [
      { name: "light", value: "#ffffff" },
      { name: "dark", value: "#333333" },
    ],
  },
  viewport: {
    viewports: {
      mobile1: {
        name: "Mobile (Small)",
        styles: { width: "375px", height: "667px" },
        type: "mobile",
      },
      mobile2: {
        name: "Mobile (Medium)",
        styles: { width: "414px", height: "896px" },
        type: "mobile",
      },
      tablet: {
        name: "Tablet",
        styles: { width: "768px", height: "1024px" },
        type: "tablet",
      },
      desktop: {
        name: "Desktop",
        styles: { width: "1280px", height: "800px" },
        type: "desktop",
      },
    },
  },
};

export const decorators = [
  (Story) => (
    <BrowserRouter>
      <Story />
    </BrowserRouter>
  ),
];
