import { format } from "date-fns";
import { supabase } from "@/lib";
import { formatDateTime, formatTime } from "@/utils/ApiResponseTimeChartUtils";
import useAppQuery from "../base/useAppQuery";
import { apisQueryKeys } from "../queryKeys";
import type { ApiCheckLog, ApiDetailData, ImpactedFeature } from "@/pages/ApiDetail/_types";
import type { LogListItemData } from "@/pages/ErrorLog/_types";
import type { ApiStatus } from "@/types";

/**
 * API 상세 페이지에서 사용하는 React Query 함수들을 모아둔 파일입니다.
 *
 * @author jikwon
 */

const RECENT_CHECK_LOG_HOURS = 24;
const RECENT_ERROR_LOG_DAYS = 7;

const FULL_DATE_FORMAT = "yyyy-MM-dd";
const HEALTHY_LOG_MESSAGE = "정상 작동 중";
const EMPTY_VALUE = "-";

const STATUS_LABEL_MAP: Record<string, ApiStatus> = {
  정상: "healthy",
  healthy: "healthy",
  degraded: "degraded",
  outage: "outage",
};

const toApiStatus = (status: string): ApiStatus => STATUS_LABEL_MAP[status] ?? "healthy";

type ApiRow = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  source: string;
  source_url: string | null;
  request_url: string | null;
  http_method: string;
  check_interval_minutes: number;
  is_notification_enabled: boolean;
  icon_url: string | null;
  is_active: boolean | null;
};

const mapToApiDetailData = (row: ApiRow): ApiDetailData => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  category: row.category,
  source: row.source,
  sourceUrl: row.source_url,
  requestUrl: row.request_url,
  httpMethod: row.http_method,
  checkIntervalMinutes: row.check_interval_minutes,
  isNotificationEnabled: row.is_notification_enabled,
  iconUrl: row.icon_url,
  isActive: row.is_active ?? false,
});

/**
 * Supabase `apis` 테이블에서 단일 API의 기본 정보를 조회합니다.
 *
 * @returns API 기본 정보
 */

export const getApiDetail = async (apiId: string): Promise<ApiDetailData> => {
  const { data, error } = await supabase
    .from("apis")
    .select(
      "id, name, description, category, source, source_url, request_url, http_method, check_interval_minutes, is_notification_enabled, icon_url, is_active"
    )
    .eq("id", apiId)
    .single<ApiRow>();

  if (error) {
    throw new Error(error.message);
  }

  return mapToApiDetailData(data);
};

/**
 * API 기본 정보 조회용 React Query 훅입니다.
 *
 * @remarks
 * - `apisQueryKeys.detail(apiId)`를 queryKey로 사용합니다.
 * - `throwOnError: true`로 설정되어 에러는 ErrorBoundary로 전파됩니다.
 *
 * @returns API 기본 정보 조회 쿼리 결과 객체
 */

export const useApiDetailQuery = (apiId: string) => {
  return useAppQuery(apisQueryKeys.detail(apiId), () => getApiDetail(apiId), {
    enabled: apiId !== "",
    throwOnError: true,
  });
};

type MonitoringResultRow = {
  id: string;
  status: string;
  response_time: number | null;
  http_status: number | null;
  error_message: string | null;
  checked_at: string;
};

const mapToApiCheckLog = (row: MonitoringResultRow): ApiCheckLog => {
  const checkedAt = new Date(row.checked_at);

  return {
    id: row.id,
    status: toApiStatus(row.status),
    time: formatTime(checkedAt.getTime()),
    fullDate: format(checkedAt, FULL_DATE_FORMAT),
    message: row.error_message ?? HEALTHY_LOG_MESSAGE,
    statusCode: row.http_status ? `HTTP ${row.http_status}` : EMPTY_VALUE,
    latency: row.response_time !== null ? `${row.response_time}ms` : EMPTY_VALUE,
  };
};

/**
 * Supabase `monitoring_results` 테이블에서 특정 API의 최근 24시간 체크 로그를 조회합니다.
 *
 * @remarks
 * - 최근 체크 로그 목록과 요약 카드(마지막 체크 시각, 마지막 응답 속도, 24시간 성공률)가
 *   같은 구간을 바라보도록 하나의 쿼리 결과를 공유합니다.
 *
 * @returns 체크 시각 기준 내림차순으로 정렬된 체크 로그 배열
 */

export const getApiCheckLogs = async (apiId: string): Promise<ApiCheckLog[]> => {
  const sinceDate = new Date();
  sinceDate.setHours(sinceDate.getHours() - RECENT_CHECK_LOG_HOURS);

  const { data, error } = await supabase
    .from("monitoring_results")
    .select("id, status, response_time, http_status, error_message, checked_at")
    .eq("api_id", apiId)
    .gte("checked_at", sinceDate.toISOString())
    .order("checked_at", { ascending: false })
    .returns<MonitoringResultRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapToApiCheckLog);
};

/**
 * 최근 24시간 체크 로그 조회용 React Query 훅입니다.
 *
 * @remarks
 * - `apisQueryKeys.checkLogs(apiId)`를 queryKey로 사용합니다.
 * - `throwOnError: true`로 설정되어 에러는 ErrorBoundary로 전파됩니다.
 *
 * @returns 체크 로그 조회 쿼리 결과 객체
 */

export const useApiCheckLogsQuery = (apiId: string) => {
  return useAppQuery(apisQueryKeys.checkLogs(apiId), () => getApiCheckLogs(apiId), {
    enabled: apiId !== "",
    throwOnError: true,
  });
};

type AffectedFeatureRow = {
  id: string;
  feature_name: string;
};

const mapToImpactedFeature = (row: AffectedFeatureRow): ImpactedFeature => ({
  id: row.id,
  name: row.feature_name,
});

/**
 * Supabase `affected_features` 테이블에서 특정 API의 영향 받는 기능 목록을 조회합니다.
 *
 * @returns 기능명 기준 오름차순으로 정렬된 영향 받는 기능 배열
 */

export const getApiAffectedFeatures = async (apiId: string): Promise<ImpactedFeature[]> => {
  const { data, error } = await supabase
    .from("affected_features")
    .select("id, feature_name")
    .eq("api_id", apiId)
    .order("feature_name", { ascending: true })
    .returns<AffectedFeatureRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapToImpactedFeature);
};

/**
 * 영향 받는 기능 목록 조회용 React Query 훅입니다.
 *
 * @remarks
 * - `apisQueryKeys.affectedFeatures(apiId)`를 queryKey로 사용합니다.
 * - `throwOnError: true`로 설정되어 에러는 ErrorBoundary로 전파됩니다.
 *
 * @returns 영향 받는 기능 목록 조회 쿼리 결과 객체
 */

export const useApiAffectedFeaturesQuery = (apiId: string) => {
  return useAppQuery(apisQueryKeys.affectedFeatures(apiId), () => getApiAffectedFeatures(apiId), {
    enabled: apiId !== "",
    throwOnError: true,
  });
};

type ApiErrorLogRow = {
  id: string;
  status: string;
  error_type: string | null;
  error_message: string | null;
  occurred_at: string;
  is_checked: boolean | null;
  // apis(name)은 many-to-one이라 실제 PostgREST 응답은 단일 객체지만, Database 제네릭이 없는
  // 클라이언트라 supabase-js 타입 추론이 배열로 잘못 나옴 (errorLog.queries.ts와 동일한 이유).
  apis: { name: string } | null;
};

const mapToLogListItem = (row: ApiErrorLogRow): LogListItemData => ({
  id: row.id,
  apiName: row.apis?.name ?? "",
  errorType: row.error_type ?? "",
  errorStatus: toApiStatus(row.status),
  errorMessage: row.error_message ?? "",
  occurredAt: formatDateTime(new Date(row.occurred_at).getTime()),
  status: row.is_checked ?? false,
});

/**
 * Supabase `error_logs` 테이블에서 특정 API의 최근 7일 에러 로그를 조회합니다.
 *
 * @returns 발생 시각 기준 내림차순으로 정렬된 에러 로그 배열
 */

export const getApiErrorLogs = async (apiId: string): Promise<LogListItemData[]> => {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - RECENT_ERROR_LOG_DAYS);

  const { data, error } = await supabase
    .from("error_logs")
    .select("id, status, error_type, error_message, occurred_at, is_checked, apis(name)")
    .eq("api_id", apiId)
    .gte("occurred_at", sinceDate.toISOString())
    .order("occurred_at", { ascending: false })
    .returns<ApiErrorLogRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapToLogListItem);
};

/**
 * 최근 7일 에러 로그 조회용 React Query 훅입니다.
 *
 * @remarks
 * - `apisQueryKeys.errorLogs(apiId)`를 queryKey로 사용합니다.
 * - `throwOnError: true`로 설정되어 에러는 ErrorBoundary로 전파됩니다.
 *
 * @returns 에러 로그 조회 쿼리 결과 객체
 */

export const useApiErrorLogsQuery = (apiId: string) => {
  return useAppQuery(apisQueryKeys.errorLogs(apiId), () => getApiErrorLogs(apiId), {
    enabled: apiId !== "",
    throwOnError: true,
  });
};
