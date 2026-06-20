import type { ChartTooltipProps } from "@/types";
import { formatDateTime } from "@/utils";

/**
 * API 응답 시간 차트의 커스텀 툴팁 컴포넌트입니다.
 *
 * @remarks
 * - `hover`된 로그의 API 이름, 응답 속도, HTTP 상태, 에러 메시지를 표시합니다.
 *
 * @author junyeol
 */

const STATUS_DOT_CLASS = {
  healthy: "bg-fill-primary-strong-default",
  degraded: "bg-accent-error",
  outage: "bg-fg-state-error",
} as const;

const STATUS_TEXT_CLASS = {
  healthy: "text-fill-primary-strong-default",
  degraded: "text-accent-error",
  outage: "text-fg-state-error",
} as const;

const STATUS_LABEL = {
  healthy: "정상",
  degraded: "지연",
  outage: "장애",
} as const;

const ApiResponseTimeTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="relative flex h-[227px] w-[282px] flex-col gap-4 rounded-[10px] border border-border-divider-default bg-bg-layout-1depth p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <div className="text-[18px] font-medium leading-[25px] text-layout-body">
          {formatDateTime(data.checkedAt)}
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-4 w-4 rounded-full ${STATUS_DOT_CLASS[data.status]}`}
          />
          <span className={`text-[20px] font-bold leading-7 ${STATUS_TEXT_CLASS[data.status]}`}>
            {STATUS_LABEL[data.status]}
          </span>
        </div>
      </div>

      <dl className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <dt className="text-[20px] font-medium leading-[27px] text-layout-body">응답 속도</dt>
          <dd className="text-[22px] font-semibold leading-[30px] text-layout-header">
            {data.responseTime}ms
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-[20px] font-medium leading-[27px] text-layout-body">HTTP 상태</dt>
          <dd className="text-[22px] font-semibold leading-[30px] text-layout-header">
            {data.httpStatus}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-[20px] font-medium leading-[27px] text-layout-body">에러 메시지</dt>
          <dd className="text-[22px] font-semibold leading-[30px] text-layout-header">
            {data.errorMessage}
          </dd>
        </div>
      </dl>

      <svg
        aria-hidden="true"
        className="absolute bottom-[-30px] left-1/2 -translate-x-1/2"
        height="30"
        viewBox="0 0 40 30"
        width="40"
      >
        <path className="fill-bg-layout-1depth" d="M0 0 L20 30 L40 0 Z" />
      </svg>
    </div>
  );
};

export default ApiResponseTimeTooltip;
