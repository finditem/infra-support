import type { ActiveApiRow } from "@/repositories/api.repository";
import {
  insertErrorLog,
  insertMonitoringResult,
} from "@/repositories/monitoring.repository";
import { resolveApiStatus, shouldWriteErrorLog } from "@/utils/status";

type CallResult = {
  ok: boolean;
  httpStatus: number | null;
  responseTime: number | null;
  errorType: string | null;
  errorMessage: string | null;
};

const KAKAO_DAPI_HOST = "dapi.kakao.com";
const KAKAO_AUTH_HOST = "kauth.kakao.com";
const KAKAO_SDK_PATH = "/v2/maps/sdk.js";
const KAKAO_AUTHORIZE_PATH = "/oauth/authorize";
const VWORLD_HOST = "api.vworld.kr";
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

const isKakaoSdkUrl = (url: URL): boolean =>
  url.hostname === KAKAO_DAPI_HOST && url.pathname === KAKAO_SDK_PATH;

const isKakaoAuthorizeUrl = (url: URL): boolean =>
  url.hostname === KAKAO_AUTH_HOST && url.pathname === KAKAO_AUTHORIZE_PATH;

const isKakaoRestApiUrl = (url: URL): boolean =>
  url.hostname === KAKAO_DAPI_HOST &&
  url.pathname.startsWith("/v2/") &&
  !isKakaoSdkUrl(url);

/**
 * 호출 대상 URL을 API 제공사 규칙에 맞게 보정하는 함수입니다.
 *
 * @remarks
 * - VWorld(`api.vworld.kr`) 요청인 경우, URL에 `key` 파라미터가 없으면
 *   `VWORLD_API_KEY` 환경변수 값을 자동으로 추가합니다.
 * - Kakao Maps SDK(`dapi.kakao.com/v2/maps/sdk.js`) 요청인 경우, `appkey`가 없으면
 *   `KAKAO_JAVASCRIPT_KEY` 환경변수 값을 자동으로 추가합니다.
 * - Kakao Maps SDK 호출 시 `autoload`, `libraries`가 없으면 기본값을 채웁니다.
 * - Kakao OAuth Authorize(`kauth.kakao.com/oauth/authorize`) 요청인 경우,
 *   `client_id`, `redirect_uri`, `response_type` 쿼리를 자동 보정합니다.
 *
 * @returns 인증/쿼리 파라미터 보정이 적용된 최종 요청 URL 문자열
 *
 * @author junyeol
 */

const buildRequestUrl = (rawUrl: string): string => {
  const url = new URL(rawUrl);

  if (url.hostname === VWORLD_HOST) {
    const vworldKey = process.env.VWORLD_API_KEY;
    if (vworldKey && !url.searchParams.has("key")) {
      url.searchParams.set("key", vworldKey);
    }
  }

  if (isKakaoSdkUrl(url)) {
    const kakaoJavascriptKey = process.env.KAKAO_JAVASCRIPT_KEY;
    if (kakaoJavascriptKey && !url.searchParams.has("appkey")) {
      url.searchParams.set("appkey", kakaoJavascriptKey);
    }

    if (!url.searchParams.has("autoload")) {
      url.searchParams.set("autoload", "false");
    }

    if (!url.searchParams.has("libraries")) {
      url.searchParams.set("libraries", "services");
    }
  }

  if (isKakaoAuthorizeUrl(url)) {
    const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;
    const kakaoRedirectUri = process.env.KAKAO_REDIRECT_URI;

    if (kakaoRestApiKey && !url.searchParams.has("client_id")) {
      url.searchParams.set("client_id", kakaoRestApiKey);
    }

    if (kakaoRedirectUri && !url.searchParams.has("redirect_uri")) {
      url.searchParams.set("redirect_uri", kakaoRedirectUri);
    }

    if (!url.searchParams.has("response_type")) {
      url.searchParams.set("response_type", "code");
    }
  }

  return url.toString();
};

/**
 * 호출 대상 API에 맞는 요청 헤더를 구성하는 함수입니다.
 *
 * @remarks
 * - Kakao Maps SDK에는 JS 응답 수신용 Accept 헤더를 설정합니다.
 * - Kakao OAuth Authorize에는 HTML 응답 수신용 Accept 헤더를 설정합니다.
 * - 그 외에는 기본적으로 `Accept: application/json` 헤더를 설정합니다.
 * - Kakao REST API(`dapi.kakao.com/v2/*`, SDK 제외) 요청인 경우
 *   `KAKAO_REST_API_KEY` 환경변수로 `Authorization` 헤더를 추가합니다.
 * - Vworld(`api.vworld.kr`) 요청인 경우
 *   게이트웨이/WAF 호환을 위해 `Referer` 헤더를 추가합니다.
 *
 * @returns API 제공사별 인증 헤더가 반영된 요청 헤더 객체
 *
 * @author junyeol
 */

const buildHeaders = (rawUrl: string): HeadersInit => {
  const url = new URL(rawUrl);
  const headers: Record<string, string> = {
    "User-Agent": DEFAULT_USER_AGENT,
  };

  if (isKakaoSdkUrl(url)) {
    headers.Accept = "text/javascript, */*;q=0.8";
  } else if (isKakaoAuthorizeUrl(url)) {
    headers.Accept = "text/html, */*;q=0.8";
  } else {
    headers.Accept = "application/json";
  }

  if (isKakaoRestApiUrl(url)) {
    const kakaoKey = process.env.KAKAO_REST_API_KEY;
    if (kakaoKey) {
      headers.Authorization = `KakaoAK ${kakaoKey}`;
    }
  }

  if (url.hostname === VWORLD_HOST) {
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
