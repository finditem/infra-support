import type { Config } from "tailwindcss";

import designTokensPreset from "@infra-support/design-tokens/tailwind";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  presets: [designTokensPreset],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        "text-default": "var(--color-text-default)",
        "text-muted": "var(--color-text-muted)",
        "text-inverse": "var(--color-text-inverse)",
        border: "var(--color-border)",
        "fg-state-error": "var(--color-fg-state-error)",
        "fill-neutural-subtle-default": "var(--color-fill-neutural-subtle-default)",
        "fill-neutural-subtle-hover": "var(--color-fill-neutural-subtle-hover)",
      },
    },
  },
};

export default config;
