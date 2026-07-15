import type { ApiResponseTimeData } from "@/types";
import type { ApiStatusDistribution } from "../_types";

/**
 * API별 가장 최근 체크의 상태를 기준으로, 전체 API의 상태 분포를 계산합니다.
 *
 * @author junyeol
 */

export const calculateApiStatusDistribution = (
  data: ApiResponseTimeData[]
): ApiStatusDistribution => {
  const latestByApi = new Map<string, ApiResponseTimeData>();

  data.forEach((item) => {
    const latest = latestByApi.get(item.apiId);
    if (!latest || item.checkedAt > latest.checkedAt) {
      latestByApi.set(item.apiId, item);
    }
  });

  const distribution: ApiStatusDistribution = { healthy: 0, degraded: 0, outage: 0 };

  latestByApi.forEach((item) => {
    distribution[item.status] += 1;
  });

  return distribution;
};
