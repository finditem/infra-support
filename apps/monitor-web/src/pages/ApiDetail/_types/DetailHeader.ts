export type ApiStatus = "normal" | "error" | "pending";

export interface ApiDetailData {
  name: string;
  statusCode: string;
  status: ApiStatus;
  category: string;
  responseTime: string;
  lastChecked: string;
  successRate: string;
}
