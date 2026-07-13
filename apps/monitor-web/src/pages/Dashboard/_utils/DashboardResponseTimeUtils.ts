import type { ApiResponseTimeData } from "@/types";

/**
 * 가장 최근 체크 시각이 속한 24시간(09:00~다음날 06:00) 구간의 데이터만 필터링합니다.
 *
 * @author junyeol
 */

export const filterLatest24HourData = (data: ApiResponseTimeData[]): ApiResponseTimeData[] => {
  if (data.length === 0) return [];

  const latestDate = new Date(Math.max(...data.map((item) => item.checkedAt)));
  const anchorDate = new Date(latestDate);
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
