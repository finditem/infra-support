import { createSupabaseClient } from "@/lib/supabase";

const BEARER_PREFIX = "Bearer ";

/**
 * Authorization 헤더의 Supabase access token을 검증하는 함수입니다.
 *
 * @remarks
 * - monitor-web이 로그인 세션의 access token을 그대로 보내면, Supabase Auth에 조회해 유효한 사용자인지 확인합니다.
 * - 크론 전용 엔드포인트(`/api/monitor`)가 쓰는 `CRON_SECRET` 방식과 달리, 브라우저에서 호출하는 엔드포인트에 사용합니다. Vite의 `VITE_*` 환경변수는 번들에 노출되므로 시크릿을 웹에서 재사용할 수 없기 때문입니다.
 * - 사용자 단위 권한은 구분하지 않습니다. 로그인 여부만 판별합니다.
 *
 * @param authHeader - 요청의 Authorization 헤더 값
 *
 * @returns 유효한 로그인 세션이면 `true`
 *
 * @author jikwon
 */

export const verifyAccessToken = async (authHeader: string | null): Promise<boolean> => {
  if (!authHeader?.startsWith(BEARER_PREFIX)) return false;

  const token = authHeader.slice(BEARER_PREFIX.length).trim();
  if (!token) return false;

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);

  return !error && Boolean(data.user);
};
