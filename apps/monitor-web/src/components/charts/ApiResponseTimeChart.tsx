import { useMemo, useState } from "react";
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
import ErrorDot, { type HoveredDotPoint } from "./_component/ErrorDot";

/**
 * API별 응답 시간 변화를 표시하는 라인 차트 컴포넌트입니다.
 *
 * @remarks
 * - `apiId`별로 데이터를 그룹화해 API마다 별도 라인을 렌더링하고, 하단에 색상-API 매핑을 보여주는
 *   legend를 직접 그립니다(recharts `Legend`는 축 너비를 고려하지 않아 왼쪽 정렬이 어긋나 미사용).
 * - `period`가 `24h`면 데이터 구간(어제 00:00~지금)을 3시간 단위로, `7d`면 최근 7일을 1일 단위로 표시합니다.
 * - `outage` 상태인 데이터만 에러 dot으로 표시합니다.
 * - 툴팁은 recharts의 axis 기반 자동 감지 대신, 각 dot의 hover 이벤트로 직접 제어합니다.
 *   같은 시간대에 여러 API 결과가 겹쳐 있어도 실제로 hover한 dot의 데이터/좌표만 정확히 표시됩니다.
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

const Y_AXIS_WIDTH = 64;

const ApiResponseTimeChart = ({ className, data, period }: ApiResponseTimeChartProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<HoveredDotPoint | null>(null);

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
      : createThreeHourTicks(minTimestamp, maxTimestamp);
  }, [data, period]);

  const xAxisDomain = useMemo(() => {
    if (xAxisTicks.length === 0) return [0, 0];
    return [xAxisTicks[0], xAxisTicks[xAxisTicks.length - 1]];
  }, [xAxisTicks]);

  const legendItems = useMemo(
    () =>
      apiSeries.map((series, index) => ({
        apiId: series[0]?.apiId ?? String(index),
        apiName: series[0]?.apiName ?? "",
        color: API_LINE_COLORS[index % API_LINE_COLORS.length],
      })),
    [apiSeries]
  );

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <div className="relative min-h-0 flex-1">
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
              width={Y_AXIS_WIDTH}
            />
            <Tooltip content={() => null} cursor={{ stroke: "#D9D9D9", strokeDasharray: "4 4" }} />
            {apiSeries.map((series, index) => {
              const color = API_LINE_COLORS[index % API_LINE_COLORS.length];

              return (
                <Line
                  key={series[0]?.apiId ?? index}
                  activeDot={false}
                  data={series}
                  dataKey="responseTime"
                  dot={<ErrorDot onHover={setHoveredPoint} />}
                  isAnimationActive={false}
                  name={series[0]?.apiName ?? ""}
                  stroke={color}
                  strokeWidth={2}
                  type="linear"
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>

        {hoveredPoint && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: hoveredPoint.cx,
              top: hoveredPoint.cy,
              transform: "translate(-50%, calc(-100% - 37px))",
            }}
          >
            <ApiResponseTimeTooltip active payload={[{ payload: hoveredPoint.payload }]} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-10 text-[12px]">
        {legendItems.map((item) => (
          <div key={item.apiId} className="flex items-center gap-2">
            <span
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-layout-body">{item.apiName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiResponseTimeChart;
