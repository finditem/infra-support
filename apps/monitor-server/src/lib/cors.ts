const ALLOWED_METHODS = "POST, OPTIONS";
const ALLOWED_HEADERS = "Authorization, Content-Type";

const parseAllowedOrigins = (): string[] =>
  (process.env.MONITOR_WEB_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

/**
 * 브라우저에서 호출하는 엔드포인트의 CORS 응답 헤더를 만드는 함수입니다.
 *
 * @remarks
 * - 허용 오리진은 `MONITOR_WEB_ORIGINS` 환경변수에 쉼표로 구분해 지정합니다 (예: `http://localhost:3000,https://status.finditem.kr`).
 * - 목록에 없는 오리진에는 빈 객체를 반환합니다. 이 경우 브라우저가 응답을 차단하므로 별도 거부 처리를 하지 않습니다.
 * - 응답이 오리진에 따라 달라지므로 `Vary: Origin`을 함께 내려 캐시 오염을 막습니다.
 *
 * @param origin - 요청의 Origin 헤더 값
 *
 * @returns 응답에 그대로 펼쳐 쓸 CORS 헤더 객체
 *
 * @author jikwon
 */

export const resolveCorsHeaders = (origin: string | null): Record<string, string> => {
  if (!origin || !parseAllowedOrigins().includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    Vary: "Origin",
  };
};
