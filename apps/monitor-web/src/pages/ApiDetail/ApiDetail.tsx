import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  useApiAffectedFeaturesQuery,
  useApiCheckLogsQuery,
  useApiDetailQuery,
  useApiErrorLogsQuery,
} from "@/queries";
import {
  DetailCheckLogs,
  DetailHeader,
  DetailImpactedFeatures,
  DetailIncidentHistory,
  DetailResponseChart,
  DetailSettings,
  DetailSummaryCards,
} from "./_components";
import { getApiSummaryData } from "./_utils";

const EMPTY_VALUE = "-";

const ApiDetail = () => {
  const { apiId = "" } = useParams<{ apiId: string }>();

  const { data: apiData } = useApiDetailQuery(apiId);
  const { data: checkLogsData } = useApiCheckLogsQuery(apiId);
  const { data: affectedFeaturesData } = useApiAffectedFeaturesQuery(apiId);
  const { data: errorLogsData } = useApiErrorLogsQuery(apiId);

  const checkLogs = useMemo(() => checkLogsData ?? [], [checkLogsData]);
  const summaryData = useMemo(() => getApiSummaryData(checkLogs), [checkLogs]);

  // 로딩과 에러 상태 UI는 별도 작업 항목이라, API 기본 정보가 도착하기 전에는 아무것도 렌더링하지 않는다.
  if (!apiData) {
    return null;
  }

  return (
    <>
      <DetailHeader apiData={apiData} statusCode={checkLogs[0]?.statusCode ?? EMPTY_VALUE} />
      <DetailSummaryCards summaryData={summaryData} />

      <div className="grid h-[620px] min-h-0 grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <DetailResponseChart />

        <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
          <DetailCheckLogs checkIntervalMinutes={apiData.checkIntervalMinutes} logs={checkLogs} />
          <DetailImpactedFeatures features={affectedFeaturesData ?? []} />
        </div>
      </div>

      <DetailSettings apiData={apiData} />

      <DetailIncidentHistory incidents={errorLogsData ?? []} />
    </>
  );
};

export default ApiDetail;
