export type ApiStatus = "healthy" | "degraded" | "outage";

const DELAY_THRESHOLD_MS = 3000;

type ResolveApiStatusParams = {
  ok: boolean;
  httpStatus: number | null;
  responseTime: number | null;
};

/**
 * API 상태를 판별하는 함수입니다.
 * 
 * @param ok - 호출 성공 여부
 * @param httpStatus - HTTP 상태 코드
 * @param responseTime - 응답 시간(ms)
 * 
 * @returns healthy | degraded | outage 상태 값
 * 
 * @author junyeol
 */

export const resolveApiStatus = ({
  ok,
  httpStatus,
  responseTime,
}: ResolveApiStatusParams): ApiStatus => {
  if (!ok) return "outage";
  if (httpStatus === null || httpStatus >= 500) return "outage";
  if (responseTime !== null && responseTime >= DELAY_THRESHOLD_MS) return "degraded";
  return "healthy";
};

export const shouldWriteErrorLog = (status: ApiStatus): boolean =>
  status === "degraded" || status === "outage";
