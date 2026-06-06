import type { ApiStatus } from "@/types";

export interface ApiResponseTimeData {
  id: string;
  apiId: string;
  apiName: string;
  responseTime: number;
  checkedAt: number;
  status: ApiStatus;
}

export interface ChartDotProps {
  cx?: number;
  cy?: number;
  payload?: ApiResponseTimeData;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ApiResponseTimeData }>;
}
