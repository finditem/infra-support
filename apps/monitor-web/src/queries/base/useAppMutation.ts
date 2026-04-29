import {
  useMutation,
  type MutationFunction,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

/**
 * React Query의 변경 로직을 프로젝트 공통 형태로 감싼 훅입니다.
 *
 * @remarks
 * - `mutationFn`을 명시적으로 받아 타입 안전성과 재사용성을 높입니다.
 * - 화면별로 `onSuccess`, `onError`, `onSettled` 등 옵션을 선택적으로 오버라이드할 수 있습니다.
 * - 성공 후 캐시 동기화는 `onSuccess`에서 `queryClient.invalidateQueries`로 처리합니다.
 *
 * @returns 뮤테이션 실행 상태/데이터/에러 정보를 포함한 React Query 결과 객체
 *
 * @author junyeol
 */

type UseAppMutationOptions<
  /** mutationFn이 반환하는 데이터 타입 */
  TData,
  /** mutationFn에 전달되는 변수 타입 */
  TVariables,
  /** 뮤테이션 실패 시 에러 타입 */
  TError,
  /** onMutate/onError/onSettled에서 사용하는 컨텍스트 타입 */
  TContext,
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutationFn">;

/**
 * @example
 * ```tsx
 * import { useAppMutation, apisQueryKeys } from "@/queries";
 * import { useQueryClient } from "@tanstack/react-query";
 *
 * const useUpdateApiMutation = () => {
 *   const queryClient = useQueryClient();
 *
 *   return useAppMutation(updateApi, {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: apisQueryKeys.all });
 *     },
 *     onError: () => {
 *       // 에러 처리 로직
 *    },
 *     onSettled: () => {
 *       // 성공/실패 후 공통 처리 로직
 *    },
 *     onMutate: () => {
 *       // 낙관적 업데이트 로직
 *    },
 *   });
 * };
 * ```
 */

const useAppMutation = <TData, TVariables = void, TError = Error, TContext = unknown>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: UseAppMutationOptions<TData, TVariables, TError, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> => {
  return useMutation({
    mutationFn,
    ...options,
  });
};

export default useAppMutation;
