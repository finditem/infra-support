import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useApiResponseTimeQuery } from "@/queries";
import type { ApiStatus } from "@/types";
import type { DashboardTimeRangeProps } from "../_types";
import { calculateApiStatusDistribution, filterLatest24HourData } from "../_utils";

type DashboardResponseStatusChartProps = Pick<DashboardTimeRangeProps, "range">;

const STATUS_CHART_META: Record<ApiStatus, { name: string; color: string }> = {
  healthy: { name: "정상", color: "#1BC587" },
  degraded: { name: "지연", color: "#FFB020" },
  outage: { name: "장애", color: "#FF6363" },
};

const DashboardResponseStatusChart = ({ range }: DashboardResponseStatusChartProps) => {
  const { data: responseTimeData } = useApiResponseTimeQuery();
  const responseTimeList = responseTimeData ?? [];

  const data = range === "24h" ? filterLatest24HourData(responseTimeList) : responseTimeList;

  const distribution = calculateApiStatusDistribution(data);
  const chartData = (Object.keys(STATUS_CHART_META) as ApiStatus[]).map((status) => ({
    name: STATUS_CHART_META[status].name,
    value: distribution[status],
    color: STATUS_CHART_META[status].color,
  }));

  const totalApiCount = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="flex h-full flex-col rounded-xl border border-border-divider-default bg-bg-layout-1depth px-12 py-8">
      <h2 className="typo-header4-bold">응답 상태 분포</h2>

      <div className="flex flex-1 flex-col justify-between">
        <div className="mt-[60px] h-[260px]">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={chartData}
                dataKey="value"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={4}
                pointerEvents="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>

              <text dominantBaseline="middle" textAnchor="middle" x="50%" y="48%">
                <tspan className="typo-body2-medium fill-layout-header" dy="-0.4em" x="50%">
                  전체 API 수
                </tspan>
                <tspan className="typo-header3-bold fill-layout-header" dy="1.6em" x="50%">
                  {totalApiCount}개
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex flex-col gap-3">
          {chartData.map((item) => (
            <li key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="typo-body2-medium text-layout-header">{item.name}</span>
              </div>

              <span className="typo-body2-bold text-layout-body">{item.value}개</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DashboardResponseStatusChart;
