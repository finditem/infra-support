import type { ApiStatus } from "@/types";
import type { ApiCheckLog, ApiSummaryData } from "../_types";

const EMPTY_VALUE = "-";

/**
 * 최근 체크 로그 목록으로부터 요약 카드에 표시할 데이터를 계산합니다.
 *
 * @remarks
 * - 상태, 마지막 체크 시각, 마지막 응답 속도는 목록의 첫 번째(가장 최근) 로그를 사용합니다.
 * - 성공률은 조회 구간(최근 24시간) 전체 로그 중 `healthy` 비율을 반올림한 값입니다.
 * - 로그가 없으면 상태는 `null`, 나머지 값은 `-`를 반환합니다.
 *
 * @returns 상태, 마지막 체크 시각, 마지막 응답 속도, 성공률을 담은 요약 데이터
 *
 * @author jikwon
 */

export const getApiSummaryData = (logs: ApiCheckLog[]): ApiSummaryData => {
  const [latestLog] = logs;

  if (!latestLog) {
    return {
      status: null,
      lastCheckedAt: EMPTY_VALUE,
      lastResponseTime: EMPTY_VALUE,
      successRate: EMPTY_VALUE,
    };
  }

  const healthyCount = logs.filter((log) => log.status === "healthy").length;

  return {
    status: latestLog.status,
    lastCheckedAt: `${latestLog.fullDate} ${latestLog.time}`,
    lastResponseTime: latestLog.latency,
    successRate: `${Math.round((healthyCount / logs.length) * 100)}%`,
  };
};

/**
 * 최근 체크 로그 목록을 상태별로 집계합니다.
 *
 * @returns 상태별 로그 개수
 *
 * @author jikwon
 */

export const getCheckLogStatusCounts = (logs: ApiCheckLog[]): Record<ApiStatus, number> => {
  const counts: Record<ApiStatus, number> = { healthy: 0, degraded: 0, outage: 0 };

  logs.forEach((log) => {
    counts[log.status] += 1;
  });

  return counts;
};

/**
 * 최근 체크 로그 목록이 실제로 포함하는 조회 구간을 문자열로 만듭니다.
 *
 * @remarks
 * - 목록은 체크 시각 기준 내림차순이므로 마지막 항목이 구간의 시작, 첫 항목이 구간의 끝입니다.
 * - 로그가 없으면 `-`를 반환합니다.
 *
 * @returns `HH:mm - HH:mm` 형식의 조회 구간 문자열
 *
 * @author jikwon
 */

export const getCheckLogTimeRange = (logs: ApiCheckLog[]): string => {
  if (logs.length === 0) {
    return EMPTY_VALUE;
  }

  return `${logs[logs.length - 1].time} - ${logs[0].time}`;
};

const MINUTES_PER_HOUR = 60;

/**
 * 분 단위로 저장된 체크 주기를 화면 표시용 문자열로 변환합니다.
 *
 * @example
 * ```ts
 * formatCheckInterval(180); // "3시간"
 * formatCheckInterval(30); // "30분"
 * formatCheckInterval(90); // "1시간 30분"
 * ```
 *
 * @returns `N시간`, `N분`, `N시간 N분` 형식의 체크 주기 문자열
 *
 * @author jikwon
 */

export const formatCheckInterval = (minutes: number): string => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainingMinutes = minutes % MINUTES_PER_HOUR;

  if (hours === 0) {
    return `${remainingMinutes}분`;
  }

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
};
