import type { Config } from "tailwindcss";
import customUtilities from "./src/utils/tailwind.plugins";
import designTokensPreset from "@infra-support/design-tokens/tailwind";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [designTokensPreset],
  theme: {
    extend: {},
  },
  plugins: [customUtilities],
};

export default config;
