import type { ApiStatus } from "@/types";

/**
 * API 응답 시간 차트에 전달되는 데이터 타입입니다.
 *
 * @remarks
 * - 서버 원본 로그를 차트 렌더링에 필요한 형태로 변환한 view model입니다.
 * - `checkedAt`은 X축 계산을 위해 timestamp number로 전달합니다.
 * - `responseTime`은 Y축 계산을 위해 ms 단위 number로 전달합니다.
 *
 * @author junyeol
 */

export interface ApiResponseTimeData {
  /** 로그 식별자 */
  id: string;
  /** API 식별자 */
  apiId: string;
  /** 툴팁에 표시할 API 이름 */
  apiName: string;
  /** 응답 시간(ms) */
  responseTime: number;
  /** 테스트 시각 timestamp */
  checkedAt: number;
  /** API 상태값 */
  status: ApiStatus;
}

/**
 * 에러 dot 렌더러가 Recharts로부터 전달받는 props입니다.
 *
 * @remarks
 * - `cx`, `cy`는 Recharts가 계산한 SVG 좌표입니다.
 * - `payload`는 해당 dot에 대응하는 원본 차트 데이터입니다.
 *
 * @author junyeol
 */

export interface ChartDotProps {
  /** dot 중심의 X 좌표 */
  cx?: number;
  /** dot 중심의 Y 좌표 */
  cy?: number;
  /** dot에 대응하는 차트 데이터 */
  payload?: ApiResponseTimeData;
}

/**
 * 커스텀 툴팁 컴포넌트가 Recharts로부터 전달받는 props입니다.
 *
 * @remarks
 * - `active`가 `true`일 때 툴팁을 표시합니다.
 * - `payload[0].payload`에 hover된 차트 데이터가 포함됩니다.
 *
 * @author junyeol
 */

export interface ChartTooltipProps {
  /** 툴팁 활성화 여부 */
  active?: boolean;
  /** hover된 차트 데이터 payload 목록 */
  payload?: Array<{ payload: ApiResponseTimeData }>;
}
