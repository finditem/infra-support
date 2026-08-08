import { supabase } from "@/lib";
import useAppQuery from "../base/useAppQuery";
import { apisQueryKeys } from "../queryKeys";

/**
 * `apis` 도메인 관련 React Query 함수들을 모아둔 파일입니다.
 *
 * @remarks
 * - API 명세가 확정되는 대로 `getApiById` 등 구체적인 쿼리 함수를 추가해주세요.
 * - 각 쿼리 함수는 `useAppQuery` 훅과 함께 사용되어야 하며, 필요한 경우 `throwOnError`, `enabled` 등의 옵션을 활용할 수 있습니다.
 *
 * @author junyeol
 */

/**
 * Supabase에서 `apis` 테이블의 데이터 타입입니다.
 */
export type ApiItem = {
  id: string;
  name: string;
  source: string;
  category: string;
  created_at: string;
};

/**
 * Supabase `apis` 테이블 목록을 생성일 기준 내림차순으로 조회합니다.
 *
 * @returns API 목록 배열
 */

export const getApis = async (): Promise<ApiItem[]> => {
  const { data, error } = await supabase
    .from("apis")
    .select("id, name, source, category, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

type UseApiListQueryOptions = {
  /** 에러를 ErrorBoundary로 던질지 여부 (default: `true`) */
  throwOnError?: boolean;
};

/**
 * API 목록 조회용 React Query 훅입니다.
 *
 * @remarks
 * - `apisQueryKeys.list()`를 queryKey로 사용하므로, 여러 화면에서 호출해도 캐시를 공유합니다.
 * - 기본값은 `throwOnError: true`이며 에러는 ErrorBoundary로 전파됩니다.
 * - Sidebar처럼 ErrorBoundary 바깥에 마운트되는 화면은 `throwOnError: false`로 넘겨
 *   에러를 쿼리 상태(`isError`)로 직접 처리해야 합니다.
 *
 * @returns API 목록 조회 쿼리 결과 객체
 */

export const useApiListQuery = ({ throwOnError = true }: UseApiListQueryOptions = {}) => {
  return useAppQuery(apisQueryKeys.list(), getApis, {
    throwOnError,
  });
};
