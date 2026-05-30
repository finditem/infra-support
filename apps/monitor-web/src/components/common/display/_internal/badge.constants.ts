import type { ApiStatus } from "@/types";

/**
 * API 상태별 Badge 표시 정보입니다.
 *
 * @remarks
 * - DB에 저장된 에러 상태에 따른 스타일을 정의합니다.
 *
 * @author junyeol
 */

export const API_STATUS_BADGE_STYLES: Record<ApiStatus, string> = {
  healthy: "text-[12px] font-bold leading-6 text-[#0AA874] bg-white border-[#0AA874]",
  degraded: "text-[12px] font-bold leading-6 text-[#FF8A05] bg-white border-[#FF8A05]",
  outage: "text-[12px] font-bold leading-6 text-[#FF3030] bg-white border-[#FF3030]",
};

/**
 * Badge 공통 베이스 스타일입니다.
 *
 * @remarks
 * - 레이아웃, 크기, 타이포그래피, 기본 테두리를 정의합니다.
 *
 * @author junyeol
 */

export const BADGE_BASE_STYLE = "inline-flex items-center justify-center rounded-full border";
