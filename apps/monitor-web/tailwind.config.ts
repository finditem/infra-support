import type { Config } from "tailwindcss";
import customUtilities from "./src/utils/tailwind.plugins";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [customUtilities],
};

export default config;
