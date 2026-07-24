import type { ApiResponseTimeData } from "@/types";
import type { ResponseTimeStats } from "../_types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 지금부터 24시간 전까지의 데이터만 필터링합니다.
 *
 * @remarks
 * - 모니터링 cron이 3시간마다(하루 8번) 돌기 때문에, 캘린더 자정 기준이 아닌
 *   순수 rolling 24시간 윈도우로도 항상 8개 안팎의 포인트가 안정적으로 확보됩니다.
 *
 * @author junyeol
 */

export const filterLatest24HourData = (data: ApiResponseTimeData[]): ApiResponseTimeData[] => {
  const windowStart = Date.now() - ONE_DAY_MS;

  return data.filter((item) => item.checkedAt >= windowStart);
};

/**
 * 응답 시간 데이터의 평균/최고/최저를 계산합니다.
 *
 * @returns 데이터가 없으면 `null`
 *
 * @author junyeol
 */

export const calculateResponseTimeStats = (
  data: ApiResponseTimeData[]
): ResponseTimeStats | null => {
  if (data.length === 0) return null;

  let sum = 0;
  let max = data[0].responseTime;
  let min = data[0].responseTime;

  data.forEach((item) => {
    sum += item.responseTime;
    if (item.responseTime > max) max = item.responseTime;
    if (item.responseTime < min) min = item.responseTime;
  });

  return {
    average: Math.round(sum / data.length),
    max,
    min,
  };
};
