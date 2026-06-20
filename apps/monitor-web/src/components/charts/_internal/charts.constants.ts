/**
 * API 라인 차트에 순서대로 적용할 stroke 색상 목록입니다.
 *
 * @remarks
 * - API 개수가 색상 수보다 많으면 순환해서 사용합니다.
 *
 * @author junyeol
 */

export const API_LINE_COLORS = [
  "#F642FF",
  "#A449FF",
  "#FF8A05",
  "#0066FF",
  "#1BC587",
  "#438FD4",
  "#E5484D",
  "#00A7B5",
];

/**
 * API 상태값별 사용자 표시 라벨입니다.
 *
 * @remarks
 * - 툴팁에서 상태값을 한글 라벨로 표시할 때 사용합니다.
 *
 * @author junyeol
 */

export const STATUS_LABEL = {
  degraded: "지연",
  healthy: "정상",
  outage: "장애",
} as const;
