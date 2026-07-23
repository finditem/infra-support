import type { Config } from "tailwindcss";

import designTokensPreset from "@infra-support/design-tokens/tailwind";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [designTokensPreset],
  theme: {
    extend: {},
  },
};

export default config;
