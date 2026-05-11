export type ApiStatus = "healthy" | "degraded" | "outage";

const DELAY_THRESHOLD_MS = 2000;

type ResolveApiStatusParams = {
  ok: boolean;
  httpStatus: number | null;
  responseTime: number | null;
};

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
