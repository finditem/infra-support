/**
 * Chip 컴포넌트의 공통 베이스 스타일입니다.
 *
 * @remarks
 * - 레이아웃 (정렬, 간격, 패딩, 둥근 모서리)와 타이포그래피를 포함한 기본 스타일입니다.
 * - 상태별 색상은 `CHIP_ACTIVE_STYLE`과 `CHIP_INACTIVE_STYLE`에서 분기합니다.
 *
 * @author junyeol
 */

export const CHIP_BASE_STYLE =
  "inline-flex w-fit items-center justify-center rounded-full gap-1.5 px-3 py-1 text-center text-base font-normal leading-6";

/**
 * Chip 활성화(checked) 상태의 스타일입니다.
 *
 * @remarks
 * - 활성화 배경/텍스트 색상을 적용합니다.
 * - `CHIP_BASE_STYLE`과 함께 사용됩니다.
 *
 * @author junyeol
 */

export const CHIP_ACTIVE_STYLE = "bg-[#E3FCEE] text-[#0AA874]";

/**
 * Chip 비활성화(unchecked) 상태의 스타일입니다.
 *
 * @remarks
 * - 비활성화 배경/텍스트 색상을 적용합니다.
 * - `CHIP_BASE_STYLE`과 함께 사용됩니다.
 *
 * @author junyeol
 */

export const CHIP_INACTIVE_STYLE = "bg-[#FFECEC] text-[#FF6363]";
