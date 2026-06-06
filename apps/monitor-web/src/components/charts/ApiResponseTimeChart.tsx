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
import type { ApiResponseTimeData } from "./_internal/types";
import { formatTime, createThreeHourTicks } from "./_internal/utils";
import { API_LINE_COLORS } from "./_internal/charts.constants";
import ApiResponseTimeTooltip from "./_component/ApiResponseTimeTooltip";
import ErrorDot from "./_component/ErrorDot";

interface ApiResponseTimeChartProps {
  data: ApiResponseTimeData[];
  className?: string;
}

const ApiResponseTimeChart = ({ className, data }: ApiResponseTimeChartProps) => {
  const maxResponseTime = Math.max(...data.map(({ responseTime }) => responseTime));

  const xAxisTicks = createThreeHourTicks(data[0].checkedAt);
  const xAxisDomain = [xAxisTicks[0], xAxisTicks[xAxisTicks.length - 1]];

  const yAxisInterval = Math.ceil(maxResponseTime / 4 / 500) * 500;
  const yAxisMax = yAxisInterval * 4;
  const yAxisTicks = Array.from({ length: 5 }, (_, index) => yAxisInterval * index);

  const apiSeries = Object.values(
    data.reduce<Record<string, ApiResponseTimeData[]>>((series, item) => {
      series[item.apiId] ??= [];
      series[item.apiId].push(item);

      return series;
    }, {})
  ).map((series) => series.sort((a, b) => a.checkedAt - b.checkedAt));

  return (
    <div className={cn("h-full w-full", className)}>
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data} margin={{ bottom: 8, left: 0, right: 16, top: 8 }}>
          <CartesianGrid
            horizontalValues={yAxisTicks}
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
            tickFormatter={formatTime}
            tickLine={false}
            tickMargin={16}
            ticks={xAxisTicks}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="responseTime"
            domain={[0, yAxisMax]}
            tick={{ fill: "#858585", fontSize: 12, textAnchor: "middle", dx: -30 }}
            tickFormatter={(value: number) => `${value}ms`}
            tickLine={false}
            ticks={yAxisTicks}
            type="number"
            width={64}
          />
          <Tooltip
            content={<ApiResponseTimeTooltip />}
            cursor={{ stroke: "#D9D9D9", strokeDasharray: "4 4" }}
          />
          {apiSeries.map((series, index) => (
            <Line
              key={series[0].apiId}
              activeDot={false}
              data={series}
              dataKey="responseTime"
              dot={<ErrorDot />}
              isAnimationActive={false}
              name={series[0].apiName}
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
