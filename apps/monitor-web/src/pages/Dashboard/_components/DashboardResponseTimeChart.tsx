import { ApiResponseTimeChart, Icon, LoadingSpinner } from "@/components";
import { useApiResponseTimeQuery } from "@/queries";
import { cn } from "@/utils";
import type { DashboardTimeRangeProps } from "../_types";
import { calculateResponseTimeStats, filterLatest24HourData } from "../_utils";

type DashboardResponseTimeChartProps = Pick<DashboardTimeRangeProps, "range">;

const RANGE_LABEL: Record<DashboardResponseTimeChartProps["range"], string> = {
  "24h": "최근 24시간",
  "7d": "최근 7일",
};

const DashboardResponseTimeChart = ({ range }: DashboardResponseTimeChartProps) => {
  const { data: responseTimeData, isLoading } = useApiResponseTimeQuery();
  const responseTimeList = responseTimeData ?? [];

  const data = range === "24h" ? filterLatest24HourData(responseTimeList) : responseTimeList;

  const outageCount = data.filter((item) => item.status === "outage").length;
  const hasOutage = outageCount > 0;
  const stats = calculateResponseTimeStats(data);

  return (
    <section className="rounded-xl border border-border-divider-default bg-bg-layout-1depth px-8 py-12">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="typo-header4-bold">전체 API 응답 속도 추이</h2>
          <p className="typo-body2-medium mt-3 text-layout-body">
            {stats
              ? `평균 ${stats.average.toLocaleString()}ms 최고 ${stats.max.toLocaleString()}ms 최저 ${stats.min.toLocaleString()}ms`
              : "데이터 없음"}
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <span
            className={cn(
              "size-4 rounded-full text-white flex-center",
              hasOutage ? "bg-fg-state-error" : "bg-fill-primary-strong-default"
            )}
          >
            <Icon height={7} name="check" width={10} />
          </span>
          <p
            className={cn(
              "typo-body2-medium",
              hasOutage ? "text-fg-state-error" : "text-fg-primary-strong-default"
            )}
          >
            {RANGE_LABEL[range]} 기준 {hasOutage ? `장애 발생 ${outageCount}건` : "장애 없음"}
          </p>
        </div>
      </div>
      <div className="mt-[60px] h-[433px]">
        {isLoading ? (
          <div className="h-full flex-center">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <ApiResponseTimeChart data={data} period={range} />
        )}
      </div>
    </section>
  );
};

export default DashboardResponseTimeChart;
