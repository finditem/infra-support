import type { ApiResponseTimeData } from "@/types";

/**
 * 데이터 중 가장 최근에 발생한 outage 항목을 찾습니다.
 *
 * @returns outage가 없으면 `null`
 *
 * @author junyeol
 */

export const findLatestOutage = (data: ApiResponseTimeData[]): ApiResponseTimeData | null =>
  data
    .filter((item) => item.status === "outage")
    .reduce<ApiResponseTimeData | null>((latest, item) => {
      if (!latest || item.checkedAt > latest.checkedAt) return item;
      return latest;
    }, null);
