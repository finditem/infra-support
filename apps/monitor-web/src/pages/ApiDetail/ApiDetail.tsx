import { useParams } from "react-router-dom";
import {
  DetailCheckLogs,
  DetailHeader,
  DetailImpactedFeatures,
  DetailIncidentHistory,
  DetailResponseChart,
  DetailSettings,
  DetailSummaryCards,
} from "./_components";
import type { ApiDetailData, ApiSummaryData } from "./_types";

const DUMMY_API_DATA: ApiDetailData = {
  name: "Kakao Map API",
  statusCode: "404",
  status: "normal" as const,
  category: "map",
  responseTime: "428ms",
  lastChecked: "2026-04-24 15:30",
  successRate: "99%",
};

const DUMMY_SUMMARY_DATA: ApiSummaryData = {
  avgResponseTime: 443,
  maxResponseTime: 1230,
  minResponseTime: 210,
  successRate: 99,
  errorCount: 1,
  lastErrorAt: "2026-04-24 13:20",
};

const ApiDetail = () => {
  const { apiId } = useParams<{ apiId: string }>();
  console.log(apiId);

  return (
    <>
      <DetailHeader apiData={DUMMY_API_DATA} />
      <DetailSummaryCards data={DUMMY_SUMMARY_DATA} />

      <div className="grid h-[620px] min-h-0 grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <DetailResponseChart />

        <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,2fr)_minmax(0,1fr)] gap-8">
          <DetailCheckLogs />
          <DetailImpactedFeatures />
        </div>
      </div>

      <DetailSettings />

      <DetailIncidentHistory />
    </>
  );
};

export default ApiDetail;
