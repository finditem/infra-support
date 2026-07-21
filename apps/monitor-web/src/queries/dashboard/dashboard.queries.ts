import { supabase } from "@/lib";
import useAppQuery from "../base/useAppQuery";
import { monitoringQueryKeys } from "../queryKeys";
import type { ApiResponseTimeData, ApiStatus } from "@/types";

const RECENT_DAYS = 7;

type MonitoringResultRow = {
  id: string;
  api_id: string;
  status: string;
  response_time: number | null;
  http_status: number | null;
  error_message: string | null;
  checked_at: string;
  // apis(name)은 many-to-one이라 실제 PostgREST 응답은 단일 객체지만, Database 제네릭이 없는
  // 클라이언트라 supabase-js 타입 추론이 배열로 잘못 나옴 (실제 REST 응답으로 확인).
  apis: { name: string } | null;
};

const STATUS_LABEL_MAP: Record<string, ApiStatus> = {
  정상: "healthy",
  healthy: "healthy",
  degraded: "degraded",
  outage: "outage",
};

export const getApiResponseTimeData = async (): Promise<ApiResponseTimeData[]> => {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - RECENT_DAYS);

  const { data, error } = await supabase
    .from("monitoring_results")
    .select("id, api_id, status, response_time, http_status, error_message, checked_at, apis(name)")
    .gte("checked_at", sinceDate.toISOString())
    .order("checked_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as MonitoringResultRow[]).map((row) => ({
    id: row.id,
    apiId: row.api_id,
    apiName: row.apis?.name ?? "-",
    responseTime: row.response_time ?? 0,
    checkedAt: new Date(row.checked_at).getTime(),
    status: STATUS_LABEL_MAP[row.status] ?? "healthy",
    httpStatus: row.http_status ? `HTTP ${row.http_status}` : "-",
    errorMessage: row.error_message ?? "-",
  }));
};

export const useApiResponseTimeQuery = () => {
  // throwOnError: false — DashboardSummaryCard가 isError로 "연결 실패" 상태를 직접 표시해야 해서,
  // 다른 쿼리들과 달리 에러를 ErrorBoundary로 던지지 않고 쿼리 상태로 노출한다.
  return useAppQuery(monitoringQueryKeys.responseTime(), getApiResponseTimeData, {
    throwOnError: false,
  });
};
