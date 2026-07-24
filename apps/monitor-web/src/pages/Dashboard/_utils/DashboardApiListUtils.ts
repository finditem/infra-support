import type { ApiResponseTimeData } from "@/types";
import { formatDateTime } from "@/utils";
import type { ApiListItem } from "../_types";

interface ApiListSourceItem {
  id: string;
  name: string;
  source: string;
  category: string;
}

export const buildDashboardApiList = (
  apis: ApiListSourceItem[],
  responseTimeData: ApiResponseTimeData[]
): ApiListItem[] => {
  // responseTimeData는 이미 checked_at 오름차순으로 조회되므로, 재정렬 없이 apiId별로
  // 그룹화만 해서 마지막 요소를 최신 데이터로 사용한다.
  const recordsByApiId = responseTimeData.reduce<Record<string, ApiResponseTimeData[]>>(
    (acc, item) => {
      acc[item.apiId] ??= [];
      acc[item.apiId].push(item);
      return acc;
    },
    {}
  );

  return apis.map((api) => {
    const records = recordsByApiId[api.id] ?? [];
    const latest = records[records.length - 1];
    const successCount = records.filter((item) => item.status !== "outage").length;

    return {
      id: api.id,
      apiName: api.name,
      apiSource: api.source,
      apiCategory: api.category,
      lastCheckedAt: latest ? formatDateTime(latest.checkedAt) : "-",
      responseTime: latest?.responseTime ?? 0,
      recentSuccessRate: records.length ? Math.round((successCount / records.length) * 100) : 0,
      apiStatus: latest?.status ?? "healthy",
    };
  });
};
