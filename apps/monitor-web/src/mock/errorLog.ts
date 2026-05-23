import type { LogListItemData } from "@/pages/ErrorLog/_types";

export const MOCK_ERROR_LOG_ITEMS: LogListItemData[] = [
  {
    id: 1,
    apiName: "Kakao Map API",
    errorType: "404",
    errorMessage: "Connection timeout after 5000ms",
    occurredAt: "2026-05-23 오전 09:12",
    status: false,
  },
  {
    id: 2,
    apiName: "Kakao Share SDK",
    errorType: "503",
    errorMessage: "Service temporarily unavailable",
    occurredAt: "2026-05-23 오후 08:51",
    status: false,
  },
];
