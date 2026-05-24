/**
 * Chip 컴포넌트의 공통 베이스 스타일입니다.
 *
 * @remarks
 * - 레이아웃 (정렬, 간격, 패딩, 둥근 모서리) 기본 스타일입니다.
 *
 * @author junyeol
 */

export const CHIP_BASE_STYLE =
  "inline-flex w-fit items-center justify-center rounded-full border px-[14px] py-[18px] text-center transition-colors";

/**
 * Chip 컴포넌트의 상태별 스타일입니다.
 *
 * @remarks
 * - Chip의 상태에 따라 해당하는 스타일속성이 적용됩니다.
 *
 * @author junyeol
 */

export const CHIP_STATE_STYLE = [
  "bg-bg-layout-1depth border-border-neutural-default text-fg-neutural-default ",
  "hover:bg-[#F9F9F9] hover:border-border-neutural-hover hover:text-fg-neutural-hover",
  "active:bg-fill-neutural-pressed active:border-border-neutural-pressed active:text-fg-neutural-pressed",
  "data-[selected=true]:bg-fill-neutural-default data-[selected=true]:border-0 data-[selected=true]:text-white",
  "disabled:bg-fill-neutural-disabled disabled:border-border-neutural-default disabled:text-fg-neutural-disabled disabled:cursor-not-allowed",
].join(" ");
