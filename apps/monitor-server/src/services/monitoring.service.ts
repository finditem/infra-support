import getActiveApis from "../repositories/api.repository";
import {
  insertErrorLog,
  insertMonitoringResult,
} from "../repositories/monitoring.repository";
import { resolveApiStatus, shouldWriteErrorLog } from "../utils/status";

type CallResult = {
  ok: boolean;
  httpStatus: number | null;
  responseTime: number | null;
  errorType: string | null;
  errorMessage: string | null;
};

type ActiveApiRow = Awaited<ReturnType<typeof getActiveApis>>[number];

const CONCURRENCY = 5;

const callApi = async (url: string, timeoutMs = 8000): Promise<CallResult> => {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const getElapsed = () => Date.now() - startedAt;

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return {
        ok: false,
        httpStatus: res.status,
        responseTime: getElapsed(),
        errorType: "http_error",
        errorMessage: `HTTP ${res.status} ${res.statusText}`,
      };
    }

    return {
      ok: true,
      httpStatus: res.status,
      responseTime: getElapsed(),
      errorType: null,
      errorMessage: null,
    };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    const elapsed = Date.now() - startedAt;

    return {
      ok: false,
      httpStatus: null,
      responseTime: elapsed,
      errorType: isAbort ? "timeout" : "network_error",
      errorMessage: error instanceof Error ? error.message : "unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
};

const processApi = async (api: ActiveApiRow): Promise<void> => {
  try {
    const checkedAt = new Date().toISOString();

    if (!api.source_url) return;

    const result = await callApi(api.source_url);
    const status = resolveApiStatus({
      ok: result.ok,
      httpStatus: result.httpStatus,
      responseTime: result.responseTime,
    });

    const normalizedErrorType =
      status === "degraded" && !result.errorType ? "slow_response" : result.errorType;

    const normalizedErrorMessage =
      status === "degraded" && !result.errorMessage
        ? `Response delayed: ${result.responseTime ?? "unknown"}ms`
        : result.errorMessage;

    const monitoringPayload = {
      api_id: api.id,
      status,
      response_time: result.responseTime,
      http_status: result.httpStatus,
      error_type: normalizedErrorType,
      error_message: normalizedErrorMessage,
      checked_at: checkedAt,
    };

    await insertMonitoringResult(monitoringPayload);

    if (shouldWriteErrorLog(status)) {
      const errorLogPayload = {
        api_id: api.id,
        status,
        error_type: normalizedErrorType,
        error_message: normalizedErrorMessage,
        response_time: result.responseTime,
        http_status: result.httpStatus,
        is_checked: false,
        occurred_at: checkedAt,
      };

      await insertErrorLog(errorLogPayload);
    }
  } catch (error) {
    console.error(`[monitoring] api_id=${api.id} 처리 실패`, error);
  }
};

export const runMonitoring = async (): Promise<void> => {
  const apis = await getActiveApis();
  let cursor = 0;
  const workerCount = Math.min(CONCURRENCY, apis.length);

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const idx = cursor++;
      if (idx >= apis.length) break;
      await processApi(apis[idx]);
    }
  });

  await Promise.all(workers);
};
