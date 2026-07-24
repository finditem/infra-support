import type { ApiResponseTimeData, ChartDotProps } from "@/types";

/**
 * hover된 지점의 실제 데이터와 화면 좌표입니다.
 *
 * @author junyeol
 */
export interface HoveredDotPoint {
  /** dot 중심의 X 좌표 */
  cx: number;
  /** dot 중심의 Y 좌표 */
  cy: number;
  /** hover된 지점의 원본 데이터 */
  payload: ApiResponseTimeData;
}

interface ErrorDotProps extends ChartDotProps {
  /** 이 dot이 hover/hover-out 될 때 호출됩니다 */
  onHover?: (point: HoveredDotPoint | null) => void;
}

/**
 * 응답 시간 차트의 dot 컴포넌트입니다.
 *
 * @remarks
 * - `payload.status`가 `outage`인 경우에만 눈에 보이는 SVG circle을 렌더링합니다.
 * - 상태와 무관하게 모든 지점에 투명한 hit 영역(r=10)을 함께 렌더링해, 겹쳐 있는
 *   여러 API 라인 중 실제로 hover한 지점의 데이터만 정확히 표시할 수 있게 합니다
 *   (recharts의 axis 기반 공유 tooltip은 겹친 지점 중 하나를 정확히 짚어내지 못합니다).
 *
 * @author junyeol
 */

const ErrorDot = ({ cx, cy, payload, onHover }: ErrorDotProps) => {
  if (!payload || cx === undefined || cy === undefined) {
    return null;
  }

  return (
    <g onMouseEnter={() => onHover?.({ cx, cy, payload })} onMouseLeave={() => onHover?.(null)}>
      <circle cx={cx} cy={cy} fill="transparent" r={10} />
      {payload.status === "outage" && (
        <circle
          className="fill-fg-state-error stroke-white"
          cx={cx}
          cy={cy}
          r={6}
          strokeWidth={1}
        />
      )}
    </g>
  );
};

export default ErrorDot;
