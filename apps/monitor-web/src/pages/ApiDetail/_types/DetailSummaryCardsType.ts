import type { ApiStatus } from "@/types";

export interface ApiSummaryData {
  status: ApiStatus | null;
  lastCheckedAt: string;
  lastResponseTime: string;
  successRate: string;
}
