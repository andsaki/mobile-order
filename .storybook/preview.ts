import { Preview } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";
import "../app/tailwind.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [(Story) => <BrowserRouter>{Story()}</BrowserRouter>],
};

export default preview;
