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
  return apis.map((api) => {
    const records = responseTimeData
      .filter((item) => item.apiId === api.id)
      .sort((a, b) => b.checkedAt - a.checkedAt);

    const latest = records[0];
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
