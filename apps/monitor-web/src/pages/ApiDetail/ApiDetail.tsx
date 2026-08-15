import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { BasicButton, ErrorBoundary, ErrorState, LoadingState } from "@/components";
import {
  DetailCheckLogs,
  DetailHeader,
  DetailImpactedFeatures,
  DetailIncidentHistory,
  DetailResponseChart,
  DetailSettings,
  DetailSummaryCards,
} from "./_components";
import { useApiDetailData } from "./_hooks";

const EMPTY_VALUE = "-";

// 쿼리를 호출하는 컴포넌트는 ErrorBoundary의 자식이어야 에러가 포착되므로, 페이지를 껍데기와 내용으로 나눈다.
const ApiDetail = () => {
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={(_error, resetBoundary) => (
        <ErrorState icon="clear" message="API 상세 정보를 불러오지 못했습니다.">
          <BasicButton
            onClick={() => {
              resetQueryErrors();
              resetBoundary();
            }}
          >
            다시 시도
          </BasicButton>
        </ErrorState>
      )}
    >
      <ApiDetailContent />
    </ErrorBoundary>
  );
};

export default ApiDetail;

const ApiDetailContent = () => {
  const { apiId = "" } = useParams<{ apiId: string }>();

  const {
    apiData,
    checkLogs,
    summaryData,
    affectedFeatures,
    errorLogs,
    isCheckLogsPending,
    isAffectedFeaturesPending,
    isErrorLogsPending,
  } = useApiDetailData(apiId);

  // 조회 실패는 ErrorBoundary로 던져지므로, 기본 정보가 없다는 것은 아직 로딩 중이라는 뜻이다.
  // 헤더와 설정 정보는 이 데이터 없이 골격조차 그릴 수 없어서 이 쿼리만 페이지 전체를 막고,
  // 나머지 세 쿼리는 각 섹션 안에서 따로 기다려 레이아웃이 흔들리지 않게 한다.
  if (!apiData) {
    return <LoadingState message="API 상세 정보를 불러오는 중입니다." />;
  }

  return (
    <>
      <DetailHeader apiData={apiData} statusCode={checkLogs[0]?.statusCode ?? EMPTY_VALUE} />
      <DetailSummaryCards isPending={isCheckLogsPending} summaryData={summaryData} />

      <div className="grid h-[520px] min-h-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <DetailResponseChart />

        <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
          <DetailCheckLogs
            checkIntervalMinutes={apiData.checkIntervalMinutes}
            isPending={isCheckLogsPending}
            logs={checkLogs}
          />
          <DetailImpactedFeatures
            features={affectedFeatures}
            isPending={isAffectedFeaturesPending}
          />
        </div>
      </div>

      <DetailSettings apiData={apiData} />

      <DetailIncidentHistory incidents={errorLogs} isPending={isErrorLogsPending} />
    </>
  );
};
