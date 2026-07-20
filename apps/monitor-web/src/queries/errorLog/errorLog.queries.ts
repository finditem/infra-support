import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib";
import useAppQuery from "../base/useAppQuery";
import useAppMutation from "../base/useAppMutation";
import { errorLogQueryKeys } from "../queryKeys";
import { formatDateTime } from "@/utils/ApiResponseTimeChartUtils";
import type { LogListItemData } from "@/pages/ErrorLog/_types";
import type { ApiStatus } from "@/types";

/**
 * `error_logs` 도메인 관련 React Query 함수들을 모아둔 파일입니다.
 *
 * @author junyeol
 */

type ErrorLogRow = {
  id: string;
  status: string;
  error_type: string | null;
  error_message: string | null;
  occurred_at: string;
  is_checked: boolean | null;
  apis: { name: string } | null;
};

const mapToLogListItem = (row: ErrorLogRow): LogListItemData => ({
  id: row.id,
  apiName: row.apis?.name ?? "",
  errorType: row.error_type ?? "",
  errorStatus: row.status as ApiStatus,
  errorMessage: row.error_message ?? "",
  occurredAt: formatDateTime(new Date(row.occurred_at).getTime()),
  status: row.is_checked ?? false,
});

/**
 * Supabase `error_logs` 테이블을 발생 시각 기준 내림차순으로 조회하고,
 * `apis` 테이블과 join해 API 이름을 함께 가져옵니다.
 *
 * @returns 에러 로그 목록 배열
 */

export const getErrorLogs = async (): Promise<LogListItemData[]> => {
  const { data, error } = await supabase
    .from("error_logs")
    .select("id, status, error_type, error_message, occurred_at, is_checked, apis(name)")
    .order("occurred_at", { ascending: false })
    .returns<ErrorLogRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapToLogListItem);
};

/**
 * 에러 로그 목록 조회용 React Query 훅입니다.
 *
 * @remarks
 * - `errorLogQueryKeys.list()`를 queryKey로 사용합니다.
 * - `throwOnError: true`로 설정되어 에러는 ErrorBoundary로 전파됩니다.
 *
 * @returns 에러 로그 목록 조회 쿼리 결과 객체
 */

export const useErrorLogListQuery = () => {
  return useAppQuery(errorLogQueryKeys.list(), getErrorLogs, {
    throwOnError: true,
  });
};

type UpdateErrorLogCheckedVariables = {
  id: string;
  checked: boolean;
};

const updateErrorLogChecked = async ({ id, checked }: UpdateErrorLogCheckedVariables) => {
  const { error } = await supabase.from("error_logs").update({ is_checked: checked }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * 에러 로그 확인 상태(`is_checked`)를 갱신하는 React Query 뮤테이션 훅입니다.
 *
 * @remarks
 * - 성공 시 `errorLogQueryKeys.list()` 캐시를 무효화해 목록을 다시 조회합니다.
 *
 * @returns 확인 상태 변경 뮤테이션 결과 객체
 */

export const useUpdateErrorLogCheckedMutation = () => {
  const queryClient = useQueryClient();

  return useAppMutation(updateErrorLogChecked, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: errorLogQueryKeys.list() });
    },
  });
};
