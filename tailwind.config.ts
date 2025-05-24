import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff8c00",
        secondary: "#007bff",
        background: "#e0f2fe", // Sky 100
        text: "#000000",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      extend: {
        square: {
          width: "100%",
          height: "100%",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
