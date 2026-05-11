import getActiveApis from "../repositories/api.repository";
import {
  insertErrorLog,
  insertMonitoringResult,
  type ErrorLogInsert,
  type MonitoringResultInsert,
} from "../repositories/monitoring.repository";
import { resolveApiStatus, shouldWriteErrorLog } from "../utils/status";

type CallResult = {
  ok: boolean;
  httpStatus: number | null;
  responseTime: number | null;
  errorType: string | null;
  errorMessage: string | null;
};

const callApi = async (url: string, timeoutMs = 8000): Promise<CallResult> => {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    const elapsed = Date.now() - startedAt;

    if (!res.ok) {
      return {
        ok: false,
        httpStatus: res.status,
        responseTime: elapsed,
        errorType: "http_error",
        errorMessage: `HTTP ${res.status} ${res.statusText}`,
      };
    }

    return {
      ok: true,
      httpStatus: res.status,
      responseTime: elapsed,
      errorType: null,
      errorMessage: null,
    };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      httpStatus: null,
      responseTime: null,
      errorType: isAbort ? "timeout" : "network_error",
      errorMessage: error instanceof Error ? error.message : "unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const runMonitoring = async (): Promise<void> => {
  const apis = await getActiveApis();

  for (const api of apis) {
    const checkedAt = new Date().toISOString();

    if (!api.source_url) continue;

    const result = await callApi(api.source_url);
    const status = resolveApiStatus({
      ok: result.ok,
      httpStatus: result.httpStatus,
      responseTime: result.responseTime,
    });

    const monitoringPayload: MonitoringResultInsert = {
      api_id: api.id,
      status,
      response_time: result.responseTime,
      http_status: result.httpStatus,
      error_type: result.errorType,
      error_message: result.errorMessage,
      checked_at: checkedAt,
    };

    await insertMonitoringResult(monitoringPayload);

    if (shouldWriteErrorLog(status)) {
      const errorLogPayload: ErrorLogInsert = {
        api_id: api.id,
        status,
        error_type: result.errorType,
        error_message: result.errorMessage,
        response_time: result.responseTime,
        http_status: result.httpStatus,
        is_checked: false,
        occurred_at: checkedAt,
      };

      await insertErrorLog(errorLogPayload);
    }
  }
};
