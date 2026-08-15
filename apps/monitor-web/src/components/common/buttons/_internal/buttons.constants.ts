export type Size = "big" | "medium" | "small";

export const SIZE_STYLES: Record<Size, string> = {
  big: "h-10 px-4 text-sm font-semibold",
  medium: "h-9 px-3.5 text-sm font-semibold",
  small: "h-8 min-w-14 px-3 text-xs font-semibold",
};

export const LOADING_SPINNER_SIZE: Record<Size, number> = {
  big: 18,
  medium: 16,
  small: 14,
};

export type Variant = "primary" | "outline";

export const BASE_STYLES =
  "relative inline-flex min-w-16 items-center justify-center gap-2 rounded-lg transition-colors text-white";

export const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    "bg-fill-primary-strong-default hover:bg-fill-primary-strong-hover active:bg-fill-primary-strong-pressed",
  outline:
    "border border-border-neutural-normal-default bg-white text-fg-neutural-default hover:bg-fill-neutural-subtle-hover active:bg-fill-neutural-subtle-pressed",
};

export const STATE_STYLES =
  "disabled:cursor-not-allowed disabled:bg-fill-neutural-subtle-disabled disabled:text-fg-neutural-disabled";

export const LOADING_STYLES = "pointer-events-none bg-[#C0C0C0]";
