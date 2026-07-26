import type { LogListItemData, LogSummaryData } from "../_types";

/**
 * 에러 로그 목록으로부터 요약 카드에 표시할 데이터를 계산합니다.
 *
 * @remarks
 * - 최근 발생 에러 API는 `occurredAt` 값이 가장 큰(가장 최근) 항목의 `apiName`을 사용합니다.
 * - `items`가 비어 있으면 `recentErrorApiName`은 빈 문자열을 반환합니다.
 *
 * @returns 전체 건수, 미확인 건수, 최근 발생 에러 API명을 담은 요약 데이터
 *
 * @author junyeol
 */

export const getLogSummaryData = (items: LogListItemData[]): LogSummaryData => {
  const unCheckedErrors = items.filter((item) => !item.status).length;
  const recentErrorApiName = items.reduce<LogListItemData | undefined>(
    (latest, item) => (!latest || item.occurredAt > latest.occurredAt ? item : latest),
    undefined
  )?.apiName;

  return {
    totalErrors: items.length,
    unCheckedErrors,
    recentErrorApiName: recentErrorApiName ?? "",
  };
};
