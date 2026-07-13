import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/utils";
import type { ApiResponseTimeData, ApiResponseTimePeriod } from "@/types";
import { createDailyTicks, createThreeHourTicks, formatDate, formatTime } from "@/utils";
import { API_LINE_COLORS } from "./_internal/charts.constants";
import ApiResponseTimeTooltip from "./_component/ApiResponseTimeTooltip";
import ErrorDot from "./_component/ErrorDot";

/**
 * API별 응답 시간 변화를 표시하는 라인 차트 컴포넌트입니다.
 *
 * @remarks
 * - `apiId`별로 데이터를 그룹화해 API마다 별도 라인을 렌더링합니다.
 * - `period`가 `24h`면 X축을 09:00부터 다음날 06:00까지 3시간 단위로, `7d`면 최근 7일을 1일 단위로 표시합니다.
 * - `outage` 상태인 데이터만 에러 dot으로 표시합니다.
 * - 부모 요소가 높이를 제공해야 `ResponsiveContainer`가 정상 렌더링 됩니다.
 *
 * @authore junyeol
 */

interface ApiResponseTimeChartProps {
  /** API 응답 시간 차트에 표시할 데이터 */
  data: ApiResponseTimeData[];
  /** X축 기간 단위 */
  period: ApiResponseTimePeriod;
  /** 차트 컨테이너에 적용할 추가 클래스명 */
  className?: string;
}

/**
 * @example
 * ```tsx
 * <div className="h-[320px]">
 *   <ApiResponseTimeChart data={chartData} period="24h" />
 * </div>
 * ```
 */

const ApiResponseTimeChart = ({ className, data, period }: ApiResponseTimeChartProps) => {
  const apiSeries = useMemo(() => {
    if (data.length === 0) return [];
    return Object.values(
      data.reduce<Record<string, ApiResponseTimeData[]>>((series, item) => {
        series[item.apiId] ??= [];
        series[item.apiId].push(item);

        return series;
      }, {})
    ).map((series) => series.sort((a, b) => a.checkedAt - b.checkedAt));
  }, [data]);

  const xAxisTicks = useMemo(() => {
    if (data.length === 0) return [];

    let minTimestamp = data[0].checkedAt;
    let maxTimestamp = data[0].checkedAt;
    data.forEach((item) => {
      if (item.checkedAt < minTimestamp) minTimestamp = item.checkedAt;
      if (item.checkedAt > maxTimestamp) maxTimestamp = item.checkedAt;
    });

    return period === "7d"
      ? createDailyTicks(minTimestamp, maxTimestamp)
      : createThreeHourTicks(minTimestamp);
  }, [data, period]);

  const xAxisDomain = useMemo(() => {
    if (xAxisTicks.length === 0) return [0, 0];
    return [xAxisTicks[0], xAxisTicks[xAxisTicks.length - 1]];
  }, [xAxisTicks]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={cn("h-full w-full", className)}>
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data} margin={{ bottom: 8, left: 0, right: 16, top: 8 }}>
          <CartesianGrid
            stroke="#D0D5DD"
            strokeDasharray="4 4"
            strokeOpacity={1}
            strokeWidth={1}
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="checkedAt"
            domain={xAxisDomain}
            tick={{ fill: "#858585", fontSize: 12 }}
            tickFormatter={period === "7d" ? formatDate : formatTime}
            tickLine={false}
            tickMargin={16}
            ticks={xAxisTicks}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="responseTime"
            domain={[0, "auto"]}
            tick={{ fill: "#858585", fontSize: 12, textAnchor: "middle", dx: -30 }}
            tickCount={5}
            tickFormatter={(value: number) => `${value}ms`}
            tickLine={false}
            type="number"
            width={64}
          />
          <Tooltip
            content={<ApiResponseTimeTooltip />}
            cursor={{ stroke: "#D9D9D9", strokeDasharray: "4 4" }}
          />
          {apiSeries.map((series, index) => (
            <Line
              key={series[0]?.apiId ?? index}
              activeDot={false}
              data={series}
              dataKey="responseTime"
              dot={<ErrorDot />}
              isAnimationActive={false}
              name={series[0]?.apiName ?? ""}
              stroke={API_LINE_COLORS[index % API_LINE_COLORS.length]}
              strokeWidth={2}
              type="linear"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ApiResponseTimeChart;
