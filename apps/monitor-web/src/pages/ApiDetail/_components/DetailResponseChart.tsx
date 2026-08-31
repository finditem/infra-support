import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ApiResponseTimeChart, ErrorState, LoadingSpinner } from "@/components";
import { useApiResponseTimeQuery } from "@/queries";
import type { ApiResponseTimePeriod } from "@/types";

const CHART_PERIOD: ApiResponseTimePeriod = "7d";

const DetailResponseChart = () => {
  const { apiId } = useParams<{ apiId: string }>();
  // 이 쿼리만 throwOnError: false라 에러가 ErrorBoundary로 가지 않으므로, 여기서 isError를 직접 처리한다.
  const { data: responseTimeData, isLoading, isError } = useApiResponseTimeQuery();

  const chartData = useMemo(
    () => (responseTimeData ?? []).filter((item) => item.apiId === apiId),
    [responseTimeData, apiId]
  );

  const outageCount = chartData.filter((item) => item.status === "outage").length;
  const hasData = chartData.length > 0;

  return (
    <section
      aria-labelledby="response-chart-title"
      className="flex min-h-0 min-w-0 flex-col gap-5 rounded-xl border border-border-neutural-normal-default bg-white px-6 py-5"
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
            <LoadingSpinner size={28} />
          </div>
        )}

        {!isLoading && isError && (
          <ErrorState icon="clear" message="응답 속도 데이터를 불러오지 못했습니다." />
        )}

        {!isLoading && !isError && !hasData && (
          <p className="typo-body2-medium h-full text-layout-body flex-center">
            표시할 응답 속도 데이터가 없습니다.
          </p>
        )}

        {!isLoading && !isError && hasData && (
          <ApiResponseTimeChart data={chartData} period={CHART_PERIOD} showLegend={false} />
        )}
      </div>
    </section>
  );
};

export default DetailResponseChart;
