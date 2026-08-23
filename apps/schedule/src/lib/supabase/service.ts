import { createClient } from "@supabase/supabase-js";

/**
 * Slack 웹훅, cron 라우트처럼 로그인 세션이 없는 서버 전용 요청에서만 사용한다.
 * service role 키는 RLS를 우회하므로 클라이언트 컴포넌트/번들에는 절대 import하지 않는다.
 */
export const createServiceClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
