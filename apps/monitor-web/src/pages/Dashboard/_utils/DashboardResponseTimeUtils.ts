import type { ApiResponseTimeData } from "@/types";
import type { ResponseTimeStats } from "../_types";

/**
 * 가장 최근 체크 시각이 속한 24시간(09:00~다음날 06:00) 구간의 데이터만 필터링합니다.
 *
 * @author junyeol
 */

export const filterLatest24HourData = (data: ApiResponseTimeData[]): ApiResponseTimeData[] => {
  if (data.length === 0) return [];

  const latestTimestamp = data.reduce(
    (latest, item) => (item.checkedAt > latest ? item.checkedAt : latest),
    data[0].checkedAt
  );
  const anchorDate = new Date(latestTimestamp);
  if (anchorDate.getHours() < 9) {
    anchorDate.setDate(anchorDate.getDate() - 1);
  }
  anchorDate.setHours(9, 0, 0, 0);

  const windowStart = anchorDate.getTime();
  const windowEnd = new Date(anchorDate);
  windowEnd.setDate(windowEnd.getDate() + 1);
  windowEnd.setHours(6, 59, 59, 999);

  return data.filter(
    (item) => item.checkedAt >= windowStart && item.checkedAt <= windowEnd.getTime()
  );
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
