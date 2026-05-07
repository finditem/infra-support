// TODO(준열) : 디자인 시스템 정립에 따라 기본 스타일 및 API 상태에 따른 스타일 변경 예정

/**
 * Badge 컴포넌트에서 사용하는 API 상태 타입입니다.
 *
 * @remarks
 * - `healthy`: 정상
 * - `degraded`: 지연
 * - `outage`: 장애
 *
 * @author junyeol
 */

export type ApiStatus = "healthy" | "degraded" | "outage";

/**
 * API 상태별 Badge 표시 정보입니다.
 *
 * @remarks
 * - `label`: 상태별 노출 텍스트
 * - `className`: 상태별 색상 및 테두리 스타일
 *
 * @author junyeol
 */

export const API_STATUS_BADGE_STYLES: Record<ApiStatus, { label: string; className: string }> = {
  healthy: {
    label: "정상",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  degraded: {
    label: "지연",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  outage: {
    label: "장애",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

/**
 * Badge 공통 베이스 스타일입니다.
 *
 * @remarks
 * - 레이아웃, 크기, 타이포그래피, 기본 테두리를 정의합니다.
 *
 * @author junyeol
 */

export const BADGE_BASE_STYLE =
  "inline-flex w-fit h-6 items-center justify-center gap-1 rounded-full border px-3 py-1 text-xs font-medium";
