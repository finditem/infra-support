import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryFunction,
} from "@tanstack/react-query";

/**
 * React Query의 조회 로직을 프로젝트 공통 형태로 감싼 훅입니다.
 *
 * @remarks
 * - `queryKey`와 `queryFn`은  명시적으로 받아 타입 안전성과 재사용성을 높입니다.
 * - 화면별로 `throwOnError`, `enabled`, `select` 등 옵션을 선택적으로 오버라이드할 수 있습니다.
 *
 * @returns 쿼리 실행 상태/데이터/에러 정보를 포함한 React Query 결과 객체
 *
 * @author junyeol
 */

type UseAppQueryOptions<
  /** queryFn이 반환하는 원본 데이터 타입 */
  TQueryFnData,
  /** 쿼리 실패 시 에러 타입 */
  TError,
  /** select 적용 후 최종적으로 훅이 반환하는 데이터 타입 */
  TData,
  /** 쿼리 캐시 식별에 사용하는 queryKey 타입 */
  TQueryKey extends QueryKey,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey" | "queryFn">;

/**
 * @example
 * ```tsx
 * const apisListQuery = useAppQuery(
 *   ["apis", "list"] as const,
 *   () => fetchApisList(),
 *   {
 *     throwOnError: true,
 *   }
 * );
 * ```
 */

const useAppQuery = <
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: UseAppQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> => {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
};

export default useAppQuery;
