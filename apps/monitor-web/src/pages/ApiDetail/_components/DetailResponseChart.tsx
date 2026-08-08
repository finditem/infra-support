import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ApiResponseTimeChart, LoadingSpinner } from "@/components";
import { useApiResponseTimeQuery } from "@/queries";
import type { ApiResponseTimePeriod } from "@/types";

const CHART_PERIOD: ApiResponseTimePeriod = "7d";

const DetailResponseChart = () => {
  const { apiId } = useParams<{ apiId: string }>();
  const { data: responseTimeData, isLoading } = useApiResponseTimeQuery();

  const chartData = useMemo(
    () => (responseTimeData ?? []).filter((item) => item.apiId === apiId),
    [responseTimeData, apiId]
  );

  const outageCount = chartData.filter((item) => item.status === "outage").length;
  const hasData = chartData.length > 0;

  return (
    <section
      aria-labelledby="response-chart-title"
      className="flex min-h-0 min-w-0 flex-col gap-8 rounded-xl border border-border-neutural-normal-default bg-white px-12 py-8"
    >
      <div className="flex items-center justify-between">
        <h2 id="response-chart-title" className="typo-header3-bold">
          응답 속도 추이
        </h2>
        <span className="typo-body2-medium text-layout-body">
          최근 7일 {hasData && `· 장애 ${outageCount}건`}
        </span>
      </div>

      <div className="min-h-0 flex-1">
        {isLoading && (
          <div className="h-full flex-center">
            <LoadingSpinner size={32} />
          </div>
        )}

        {!isLoading && !hasData && (
          <p className="typo-body2-medium h-full text-layout-body flex-center">
            표시할 응답 속도 데이터가 없습니다.
          </p>
        )}

        {!isLoading && hasData && (
          <ApiResponseTimeChart data={chartData} period={CHART_PERIOD} showLegend={false} />
        )}
      </div>
    </section>
  );
};

export default DetailResponseChart;
