//TODO(준열): 향후 디자인 시스템 확립시 상수화된 스타일 값들 수정 예정 , 현재 운영팀 스타일 참고하여 작성

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

export const VARIANT_STYLES = {
  solid: {
    normal:
      "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-700 disabled:bg-slate-300 disabled:text-slate-500",
    subtle:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400",
  },
  outlined: {
    base: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 disabled:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
  },
  inversed: {
    base: "bg-white/10 text-white hover:bg-white/20 active:bg-white/25 disabled:bg-white/5 disabled:text-white/50",
  },
  auth: {
    base: "h-11 w-full rounded-lg bg-slate-900 text-base font-semibold text-white hover:bg-slate-800 active:bg-slate-700 disabled:bg-slate-300 disabled:text-slate-500",
  },
} as const;

export const BASE_STYLES =
  "inline-flex min-w-20 items-center justify-center gap-2 rounded-lg transition-colors duration-150 disabled:cursor-not-allowed";
