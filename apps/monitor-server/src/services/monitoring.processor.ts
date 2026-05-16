import type { ActiveApiRow } from "../repositories/api.repository";
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

/**
 * 호출 대상 URL을 API 제공사 규칙에 맞게 보정하는 함수입니다.
 * 
 * @remarks
 * - VWorld(`api.vworld.kr`) 요청인 경우, URL에 `key` 파라미터가 없으면
 *   `VWORLD_API_KEY` 환경변수 값을 자동으로 추가합니다.
 * 
 * @returns 인증/쿼리 파라미터 보정이 적용된 최종 요청 URL 문자열
 * 
 * @author junyeol
 */

const buildRequestUrl = (rawUrl: string): string => {
  const url = new URL(rawUrl);

  if (url.hostname === "api.vworld.kr") {
    const vworldKey = process.env.VWORLD_API_KEY;
    if (vworldKey && !url.searchParams.has("key")) {
      url.searchParams.set("key", vworldKey);
    }
  }

  return url.toString();
};

/**
 * 호출 대상 API에 맞는 요청 헤더를 구성하는 함수입니다.
 * 
 * @remarks
 * - 기본적으로 `Accept: application/json` 헤더를 설정합니다.
 * - Kakao Local API(`dapi.kakao.com`) 요청인 경우
 *   `KAKAO_REST_API_KEY` 환경변수로 `Authorization` 헤더를 추가합니다.
 * - Vworld(`api.vworld.kr`) 요청인 경우
 *  게이트웨이/WAF 호환을 위해 `User-Agent`, `Referer` 헤더를 추가합니다.
 * 
 * @returns API 제공사별 인증 헤더가 반영된 요청 헤더 객체
 * 
 * @author junyeol
 */

const buildHeaders = (rawUrl: string): HeadersInit => {
  const url = new URL(rawUrl);
  const headers: Record<string, string> = { Accept: "application/json" };

  if (url.hostname === "dapi.kakao.com") {
    const kakaoKey = process.env.KAKAO_REST_API_KEY;
    if (kakaoKey) {
      headers.Authorization = `KakaoAK ${kakaoKey}`;
    }
  }

  if (url.hostname === "api.vworld.kr") {
    headers["User-Agent"] = 
      "Mozilla/5.0 (Windows NT 10.0; Win64; 64) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36";
    headers.Referer = "https://www.finditem.kr";
  }

  return headers;
};


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

  const requestUrl = buildRequestUrl(url);
  const headers = buildHeaders(requestUrl);

  try {
    const res = await fetch(requestUrl, {
      method: "GET",
      signal: controller.signal,
      headers,
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
    const checkedAt = new Date().toISOString();

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
    console.error("[monitoring] api_id=" + api.id + " (" + api.name + ") 처리 실패", error); 
    return false;
  }
};
