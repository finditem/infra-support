import { useParams } from "react-router-dom";
import { MOCK_HEADER_DATA, MOCK_SUMMARY_DATA } from "@/mock";
import {
  DetailCheckLogs,
  DetailHeader,
  DetailImpactedFeatures,
  DetailIncidentHistory,
  DetailResponseChart,
  DetailSettings,
  DetailSummaryCards,
} from "./_components";

const ApiDetail = () => {
  const { apiId } = useParams<{ apiId: string }>();
  console.warn(apiId);

  return (
    <>
      <DetailHeader apiData={MOCK_HEADER_DATA} />
      <DetailSummaryCards data={MOCK_SUMMARY_DATA} />

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
