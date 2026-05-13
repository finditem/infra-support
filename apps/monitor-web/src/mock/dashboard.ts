import type {
  ApiCheckLog,
  ApiDetailData,
  ApiSummaryData,
  DetailSettingsData,
  ImpactedFeature,
} from "../pages/ApiDetail/_types";

export const MOCK_HEADER_DATA: ApiDetailData = {
  name: "Kakao Map API",
  statusCode: "404",
  status: "normal" as const,
  category: "map",
  responseTime: "428ms",
  lastChecked: "2026-04-24 15:30",
  successRate: "99%",
};

export const MOCK_SUMMARY_DATA: ApiSummaryData = {
  avgResponseTime: 443,
  maxResponseTime: 1230,
  minResponseTime: 210,
  successRate: 99,
  errorCount: 1,
  lastErrorAt: "2026-04-24 13:20",
};

export const MOCK_LOGS: ApiCheckLog[] = [
  {
    id: "1",
    status: "normal",
    time: "15:30",
    fullDate: "2024-05-13",
    message: "정상 작동 중",
    statusCode: "HTTP 200",
    latency: "428ms",
  },
  {
    id: "2",
    status: "error",
    time: "15:20",
    fullDate: "2024-05-13",
    message: "Connection Timeout",
    statusCode: "HTTP 504",
    latency: "5000ms",
  },
  {
    id: "3",
    status: "normal",
    time: "15:10",
    fullDate: "2024-05-13",
    message: "정상 작동 중",
    statusCode: "HTTP 200",
    latency: "312ms",
  },
];

export const MOCK_FEATURES: ImpactedFeature[] = [
  { id: "1", name: "지도 표시" },
  { id: "2", name: "위치 선택" },
  { id: "3", name: "게시글 작성 시 주소 검색" },
  { id: "4", name: "내 주변 분실물 조회" },
];

export const MOCK_SETTINGS: DetailSettingsData = {
  requestUrl: "https://dapi.kakao.com/...",
  httpMethod: "GET",
  checkInterval: "10분",
  isActive: true,
  isNotificationEnabled: true,
};
