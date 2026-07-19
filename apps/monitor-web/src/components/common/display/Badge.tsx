import { cn } from "@/utils";
import type { ApiStatus } from "@/types";
import { API_STATUS_BADGE_STYLES, BADGE_BASE_STYLE } from "./_internal/badge.constants";

/**
 * 공통 Badge 컴포넌트입니다.
 *
 * @remarks
 * - API Status Badge와 Custom Badge를 모두 지원합니다.
 * - `status`를 전달하면 사전 정의된 스타일이 적용됩니다.
 * - `label`을 전달하면 커스텀 텍스트 배지로 렌더링됩니다.
 *
 * @author junyeol
 */

type StatusBadgeProps = {
  /** API 상태값 */
  status: ApiStatus;
  /** Status Badge Label */
  label: string | number;
  /** 추가 클래스명 */
  className?: string;
  /** 라벨 왼쪽에 상태 색상 dot 표시 여부 */
  dot?: boolean;
};

type CustomBadgeProps = {
  /** Custom Badge에서는 status 지정 불가 */
  status?: never;
  /** Custom Badge Label */
  label: string | number;
  /** 추가 클래스명 */
  className?: string;
};

type BadgeProps = StatusBadgeProps | CustomBadgeProps;

/**
 * @example
 * ```tsx
 * // Status Badge 예시
 * <Badge status="healthy" label="정상" />
 * <Badge status="degraded" label="지연" />
 * <Badge status="outage" label="장애" />
 *
 * // Custom Badge 예시
 * <Badge label="커스텀 배지" className="bg-blue-50 text-blue-700 border-blue-200" />
 * ```
 */

const Badge = (props: BadgeProps) => {
  if (props.status !== undefined) {
    const statusBadgeClass = API_STATUS_BADGE_STYLES[props.status];
    return (
      <span className={cn(BADGE_BASE_STYLE, statusBadgeClass, props.className)}>
        {props.dot && <span aria-hidden className="mr-1.5 size-3 rounded-full bg-current" />}
        {props.label}
      </span>
    );
  }

  return <span className={cn(BADGE_BASE_STYLE, props.className)}>{props.label}</span>;
};

export default Badge;
