import type { ApiStatus } from "@/types";

export interface LogListItemData {
  id: string;
  apiName: string;
  errorType: string;
  errorStatus: ApiStatus;
  errorMessage: string;
  occurredAt: string;
  status: boolean;
}
