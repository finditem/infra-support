import { useMemo } from "react";
import {
  useApiAffectedFeaturesQuery,
  useApiCheckLogsQuery,
  useApiDetailQuery,
  useApiErrorLogsQuery,
} from "@/queries";
import { getApiSummaryData } from "../_utils";

/**
 * API 상세 페이지가 필요로 하는 네 가지 조회 결과를 한 번에 가져오는 훅입니다.
 *
 * @remarks
 * - 조회 실패는 각 쿼리가 그대로 던지므로, 이 훅을 쓰는 컴포넌트는 `ErrorBoundary` 안에 있어야 합니다.
 * - `apiData`가 없는 동안은 아직 로딩 중이라는 뜻이며, 페이지 골격을 그릴 수 없어 호출부에서 별도로 막아야 합니다.
 * - 목록형 데이터는 훅에서 빈 배열로 채워 반환하므로 호출부에서 다시 기본값을 줄 필요가 없습니다.
 *
 * @param apiId - 조회할 API의 식별자
 *
 * @returns 조회 결과와 로딩 여부를 담은 객체
 * - `apiData`: API 기본 정보, 로딩 중에는 `undefined`
 * - `checkLogs`: 최근 24시간 체크 로그, 체크 시각 기준 내림차순
 * - `summaryData`: `checkLogs`로부터 계산한 요약 카드 데이터
 * - `affectedFeatures`: 해당 API에 영향을 받는 기능 목록
 * - `errorLogs`: 최근 7일 장애/에러 목록
 * - `isCheckLogsPending`, `isAffectedFeaturesPending`, `isErrorLogsPending`: 섹션별 로딩 여부
 *
 * @author jikwon
 */

/**
 * @example
 * ```tsx
 * const { apiData, checkLogs, summaryData, isCheckLogsPending } = useApiDetailData(apiId);
 * ```
 */

const useApiDetailData = (apiId: string) => {
  const { data: apiData } = useApiDetailQuery(apiId);
  const { data: checkLogsData, isPending: isCheckLogsPending } = useApiCheckLogsQuery(apiId);
  const { data: affectedFeaturesData, isPending: isAffectedFeaturesPending } =
    useApiAffectedFeaturesQuery(apiId);
  const { data: errorLogsData, isPending: isErrorLogsPending } = useApiErrorLogsQuery(apiId);

  const checkLogs = useMemo(() => checkLogsData ?? [], [checkLogsData]);
  const summaryData = useMemo(() => getApiSummaryData(checkLogs), [checkLogs]);

  return {
    apiData,
    checkLogs,
    summaryData,
    affectedFeatures: affectedFeaturesData ?? [],
    errorLogs: errorLogsData ?? [],
    isCheckLogsPending,
    isAffectedFeaturesPending,
    isErrorLogsPending,
  };
};

export default useApiDetailData;
