import type { ApiStatus } from "@/types";

export interface ApiListItem {
  id: string;
  apiName: string;
  apiSource: string;
  apiCategory: string;
  lastCheckedAt: string;
  responseTime: number;
  recentSuccessRate: number;
  apiStatus: ApiStatus;
}
