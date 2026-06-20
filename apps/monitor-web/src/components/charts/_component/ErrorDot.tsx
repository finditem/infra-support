import type { ChartDotProps } from "@/types";

/**
 * 장애 상태 로그에 표시할 에러 dot 컴포넌트입니다.
 *
 * @remarks
 * - `payload.status`가 `outage`인 경우에만 SVG circle을 렌더링합니다.
 * - 정상/지연 상태 데이터는 dot을 표시하지 않습니다.
 *
 * @author junyeol
 */

const ErrorDot = ({ cx, cy, payload }: ChartDotProps) => {
  if (!payload || payload.status !== "outage" || cx === undefined || cy === undefined) {
    return null;
  }

  return (
    <circle
      className="fill-fg-state-error"
      cx={cx}
      cy={cy}
      r={6}
      stroke="#FFFFFF"
      strokeWidth={1}
    />
  );
};

export default ErrorDot;
