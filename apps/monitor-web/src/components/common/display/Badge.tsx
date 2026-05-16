import { cn } from "@/utils";
import type { ApiStatus } from "@/types";
import { API_STATUS_BADGE_STYLES, BADGE_BASE_STYLE } from "./_internal/badge.constants";

/**
 * 공통 Badge 컴포넌트입니다.
 *
 * @remarks
 * - API Status Badge와 Custom Badge를 모두 지원합니다.
 * - `status`를 전달하면 사전 정의된 라벨과 스타일이 적용됩니다.
 * - `label`을 전달하면 커스텀 텍스트 배지로 렌더링됩니다.
 *
 * @author junyeol
 */

type StatusBadgeProps = {
  /** API 상태값 */
  status: ApiStatus;
  /** Status Badge에서는 직접 label 지정 불가 */
  label?: never;
  /** 추가 클래스명 */
  className?: string;
};

type CustomBadgeProps = {
  /** Custom Badge Label */
  label: string;
  /** Custom Badge에서는 status 지정 불가 */
  status?: never;
  /** 추가 클래스명 */
  className?: string;
};

type BadgeProps = StatusBadgeProps | CustomBadgeProps;

/**
 * @example
 * ```tsx
 * // Status Badge 예시
 * <Badge status="healthy" />
 * <Badge status="degraded" />
 * <Badge status="outage" />
 *
 * // Custom Badge 예시
 * <Badge label="커스텀 배지" className="bg-blue-50 text-blue-700 border-blue-200" />
 * ```
 */

const Badge = (props: BadgeProps) => {
  if (props.status !== undefined) {
    const statusBadge = API_STATUS_BADGE_STYLES[props.status];
    return (
      <span className={cn(BADGE_BASE_STYLE, statusBadge.className, props.className)}>
        {statusBadge.label}
      </span>
    );
  }

  return <span className={cn(BADGE_BASE_STYLE, props.className)}>{props.label}</span>;
};

export default Badge;
