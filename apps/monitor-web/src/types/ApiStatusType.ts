/**
 * Badge 컴포넌트에서 사용하는 API 상태 타입입니다.
 *
 * @remarks
 * - `healthy`: 정상
 * - `degraded`: 지연
 * - `outage`: 장애
 *
 * @author junyeol
 */

export type ApiStatus = "healthy" | "degraded" | "outage";
