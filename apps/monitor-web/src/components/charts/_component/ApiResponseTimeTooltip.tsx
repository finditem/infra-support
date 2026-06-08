import type { ChartTooltipProps } from "../types";
import { STATUS_LABEL } from "../_internal/charts.constants";
import { formatDateTime } from "../utils";

/**
 * API 응답 시간 차트의 커스텀 툴팁 컴포넌트입니다.
 *
 * @remarks
 * - `hover`된 로그의 API 이름, 응답 속도, 테스트 날짜, 상태를 표시합니다.
 *
 * @author junyeol
 */

const ApiResponseTimeTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  const tooltipItems = [
    {
      label: "응답 속도",
      value: `${data.responseTime}ms`,
    },
    {
      label: "테스트 날짜",
      value: (
        <time dateTime={new Date(data.checkedAt).toISOString()}>
          {formatDateTime(data.checkedAt)}
        </time>
      ),
    },
    {
      label: "상태",
      value: STATUS_LABEL[data.status],
    },
  ];

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border-divider-default bg-bg-layout-1depth px-12 py-8 shadow-sm">
      <h3 className="typo-header4-semibold text-layout-header">{data.apiName}</h3>

      <dl className="flex items-start gap-7">
        {tooltipItems.map(({ label, value }) => (
          <div key={label} className="mr-6 flex flex-col gap-1">
            <dt className="typo-body2-semibold text-layout-body">{label}</dt>
            <dd className="typo-body1-semibold text-layout-header">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default ApiResponseTimeTooltip;
