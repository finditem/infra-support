export type Size = "big" | "medium" | "small";

export const SIZE_STYLES: Record<Size, string> = {
  big: "h-11 px-5 text-base font-semibold",
  medium: "h-10 px-4 text-sm font-semibold",
  small: "h-9 min-w-16 px-3 text-xs font-semibold",
};

export const LOADING_SPINNER_SIZE: Record<Size, number> = {
  big: 20,
  medium: 18,
  small: 16,
};

export const BASE_STYLES =
  "relative inline-flex min-w-20 items-center justify-center gap-2 rounded-lg transition-colors text-white";

export const STATE_STYLES =
  "bg-fill-primary-strong-default hover:bg-fill-primary-strong-hover active:bg-fill-primary-strong-pressed disabled:cursor-not-allowed disabled:bg-fill-neutural-disabled disabled:text-fg-neutural-disabled";

export const LOADING_STYLES = "pointer-events-none bg-[#C0C0C0]";
