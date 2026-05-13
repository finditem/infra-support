import type { ActiveApiRow } from "../repositories/api.repository";
import {
  insertErrorLog,
  insertMonitoringResult,
} from "../repositories/monitoring.repository";
import { resolveApiStatus, shouldWriteErrorLog } from "../utils/status";
import { formatInTimeZone } from "date-fns-tz";

type CallResult = {
  ok: boolean;
  httpStatus: number | null;
  responseTime: number | null;
  errorType: string | null;
  errorMessage: string | null;
};

const getKstTimestamp = (): string =>
  formatInTimeZone(new Date(), "Asia/Seoul", "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

/**
 * 단일 API 엔드포인트를 호출해 상태 판별용 결과를 반환하는 함수입니다.
 *
 * @remarks
 * - HTTP 비정상 응답은 `ok: false`와 `http_error`로 반환합니다.
 * - 네트워크/타임아웃 예외는 throw하지 않고 결과 객체로 변환합니다.
 *
 * @returns API 호출 결과(성공 여부, HTTP 상태, 응답 시간, 에러 정보)
 *
 * @author junyeol
 */

const callApi = async (url: string, timeoutMs = 5000): Promise<CallResult> => {
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

/**
 * 단일 API 모니터링 결과를 저장하는 함수입니다.
 *
 * @remarks
 * - 모니터링 결과는 항상 `monitoring_results`에 저장합니다.
 * - 상태가 `degraded`/`outage`이면 `error_logs`도 추가 저장합니다.
 * - 처리 중 예외는 내부에서 로깅하고 `false`를 반환합니다.
 *
 * @returns 저장 성공 시 `true`, 실패 시 `false`
 *
 * @author junyeol
 */

export const processApi = async (api: ActiveApiRow): Promise<boolean> => {
  try {
    const checkedAt = getKstTimestamp();

    if (!api.source_url) return true;

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
    return true;
  } catch (error) {
    console.error(`[monitoring] api_id=${api.id} 처리 실패`, error);
    return false;
  }
};
