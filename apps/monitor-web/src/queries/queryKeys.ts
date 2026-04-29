/**
 * `apis` 도메인 React Query Key 팩토리입니다.
 *
 * @remarks
 * - Key는 `all -> list/detail/..` 계층으로 확장됩니다.
 * - 새로운 Key를 추가할 때는 `all` 배열을 참조하여 일관된 네이밍과 구조를 유지해주세요.
 *
 * @author junyeol
 */

/**
 * @example
 * ```ts
 * // 기존 도메인 추가 예시
 * // status: (apiId: string) => [...apisQueryKeys.all, "status", apiId] as const
 *
 * // 새로운 도메인 추가 예시
 * // export const usersQueryKeys = { ... }
 * ```
 */

export const apisQueryKeys = {
  all: ["apis"] as const,
  list: () => [...apisQueryKeys.all, "list"] as const,
  detail: (apiId: string) => [...apisQueryKeys.all, "detail", apiId] as const,
};
