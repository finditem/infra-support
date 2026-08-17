import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks";
import { supabase } from "@/lib";
import useAppMutation from "../base/useAppMutation";
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

/**
 * 이미 등록된 API들이 사용 중인 출처 목록을 중복 없이 조회합니다.
 *
 * @remarks
 * - Supabase가 distinct를 직접 지원하지 않아 `source`만 조회한 뒤 클라이언트에서 중복을 제거합니다.
 * - 어떤 API도 사용하지 않는 출처는 목록에 나타나지 않습니다.
 *
 * @returns 가나다순으로 정렬된 출처 목록
 */

export const getApiSources = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("apis").select("source");

  if (error) {
    throw new Error(error.message);
  }

  const sources = (data ?? []).map((row) => row.source).filter(Boolean);

  return [...new Set(sources)].sort((a, b) => a.localeCompare(b));
};

/**
 * 출처 목록 조회용 React Query 훅입니다.
 *
 * @remarks
 * - `apisQueryKeys.sources()`를 queryKey로 사용합니다.
 * - 출처는 자주 바뀌지 않으므로 에러를 ErrorBoundary로 던지지 않고, 실패 시 빈 목록으로 다룹니다.
 *
 * @returns 출처 목록 조회 쿼리 결과 객체
 */

export const useApiSourcesQuery = () => {
  return useAppQuery(apisQueryKeys.sources(), getApiSources, {
    throwOnError: false,
  });
};

/**
 * Supabase `apis` 테이블의 단일 API 정보를 수정합니다.
 *
 * @returns 수정 완료 후 아무 값도 반환하지 않습니다.
 */

export const updateApi = async ({ apiId, values }: UpdateApiVariables): Promise<void> => {
  const { error } = await supabase.from("apis").update(values).eq("id", apiId);

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * `apis` 테이블 수정 시 전달할 수 있는 컬럼입니다.
 *
 * @remarks
 * - `@infra-support/shared`의 `ApisUpdate`와 같은 스키마를 가리키지만, monitor-web은 그 패키지를 의존성으로 두지 않아 이 파일의 `ApiItem`과 같은 방식으로 로컬에 선언합니다.
 * - 모니터링 동작에 직접 관여하는 컬럼(`request_url`, `check_interval_minutes`, 임계값 등)은 수정 화면에서 다루지 않으므로 제외했습니다.
 */

export type ApiUpdateValues = {
  name: string;
  description: string | null;
  source: string;
  source_url: string | null;
  category: string;
  icon_url: string | null;
  is_active: boolean;
  memo: string | null;
};

type UpdateApiVariables = {
  /** 수정할 API의 식별자 */
  apiId: string;
  /** 변경할 컬럼을 담은 값 객체 */
  values: ApiUpdateValues;
};

/**
 * API 정보 수정용 React Query 훅입니다.
 *
 * @remarks
 * - 성공 시 상세(`apisQueryKeys.detail`)와 목록(`apisQueryKeys.list`) 캐시를 모두 무효화합니다. 이름이나 출처가 바뀌면 사이드바 목록도 함께 갱신되어야 하기 때문입니다.
 * - 출처가 새로 생기거나 사라질 수 있으므로 출처 목록 캐시도 함께 무효화합니다.
 * - 성공과 실패를 토스트로 알립니다. 성공 후 화면 이동은 호출부에서 처리합니다.
 *
 * @returns API 수정 뮤테이션 결과 객체
 */

export const useApiUpdateMutation = (apiId: string) => {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  return useAppMutation(updateApi, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apisQueryKeys.detail(apiId) });
      queryClient.invalidateQueries({ queryKey: apisQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: apisQueryKeys.sources() });

      success("저장되었습니다.", "변경한 API 정보가 반영되었습니다.");
    },
    onError: () => {
      errorToast("저장에 실패했습니다.", "잠시 후 다시 시도해 주세요.");
    },
  });
};
