import type { ApiStatus } from "@/types";

export interface ApiDetailData {
  name: string;
  statusCode: string;
  status: ApiStatus;
  category: string;
  responseTime: string;
  lastChecked: string;
  successRate: string;
}
